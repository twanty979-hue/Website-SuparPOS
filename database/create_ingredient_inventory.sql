begin;

create table if not exists public.ingredient_categories (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ingredient_categories_brand_name_unique
    unique (brand_id, name)
);

create index if not exists ingredient_categories_brand_active_idx
  on public.ingredient_categories(brand_id, is_active, sort_order, name);

create table if not exists public.measurement_units (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  code text not null,
  name text not null,
  symbol text not null,
  dimension text not null default 'custom',
  factor_to_canonical numeric(18,8),
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint measurement_units_dimension_check check (
    dimension in ('mass', 'volume', 'count', 'length', 'custom')
  ),
  constraint measurement_units_factor_positive check (
    factor_to_canonical is null or factor_to_canonical > 0
  )
);

create unique index if not exists measurement_units_global_code_unique
  on public.measurement_units(lower(code))
  where brand_id is null;
create unique index if not exists measurement_units_brand_code_unique
  on public.measurement_units(brand_id, lower(code))
  where brand_id is not null;
create index if not exists measurement_units_lookup_idx
  on public.measurement_units(brand_id, is_active, dimension, name);

insert into public.measurement_units (
  id,
  brand_id,
  code,
  name,
  symbol,
  dimension,
  factor_to_canonical,
  is_system
)
values
  ('00000000-0000-4000-8000-000000000001', null, 'mg', 'มิลลิกรัม', 'mg', 'mass', 0.001, true),
  ('00000000-0000-4000-8000-000000000002', null, 'g', 'กรัม', 'g', 'mass', 1, true),
  ('00000000-0000-4000-8000-000000000003', null, 'kg', 'กิโลกรัม', 'kg', 'mass', 1000, true),
  ('00000000-0000-4000-8000-000000000004', null, 'ml', 'มิลลิลิตร', 'ml', 'volume', 1, true),
  ('00000000-0000-4000-8000-000000000005', null, 'l', 'ลิตร', 'L', 'volume', 1000, true),
  ('00000000-0000-4000-8000-000000000006', null, 'piece', 'ชิ้น', 'ชิ้น', 'count', 1, true),
  ('00000000-0000-4000-8000-000000000007', null, 'egg', 'ฟอง', 'ฟอง', 'count', 1, true),
  ('00000000-0000-4000-8000-000000000008', null, 'bottle', 'ขวด', 'ขวด', 'count', 1, true),
  ('00000000-0000-4000-8000-000000000009', null, 'meter', 'เมตร', 'm', 'length', 1, true),
  ('00000000-0000-4000-8000-000000000010', null, 'centimeter', 'เซนติเมตร', 'cm', 'length', 0.01, true)
on conflict (id) do update set
  name = excluded.name,
  symbol = excluded.symbol,
  dimension = excluded.dimension,
  factor_to_canonical = excluded.factor_to_canonical,
  is_active = true;

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  sku text,
  category text,
  category_id uuid references public.ingredient_categories(id) on delete set null,
  base_unit text not null,
  base_unit_id uuid references public.measurement_units(id) on delete restrict,
  minimum_stock numeric(18,4) not null default 0,
  allow_negative boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ingredients
  drop constraint if exists ingredients_base_unit_check;
alter table public.ingredients
  add column if not exists category_id uuid;
alter table public.ingredients
  add column if not exists base_unit_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ingredients_category_id_fkey'
  ) then
    alter table public.ingredients
      add constraint ingredients_category_id_fkey
      foreign key (category_id)
      references public.ingredient_categories(id)
      on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'ingredients_base_unit_id_fkey'
  ) then
    alter table public.ingredients
      add constraint ingredients_base_unit_id_fkey
      foreign key (base_unit_id)
      references public.measurement_units(id)
      on delete restrict;
  end if;
end;
$$;

insert into public.ingredient_categories (brand_id, name)
select distinct i.brand_id, btrim(i.category)
from public.ingredients i
where i.category is not null and btrim(i.category) <> ''
on conflict (brand_id, name) do nothing;

update public.ingredients i
set category_id = c.id
from public.ingredient_categories c
where i.category_id is null
  and c.brand_id = i.brand_id
  and c.name = btrim(i.category);

update public.ingredients i
set base_unit_id = u.id
from public.measurement_units u
where i.base_unit_id is null
  and u.brand_id is null
  and lower(u.code) = lower(i.base_unit);

create unique index if not exists ingredients_brand_sku_unique
  on public.ingredients(brand_id, lower(sku))
  where sku is not null and btrim(sku) <> '';
create index if not exists ingredients_brand_active_idx
  on public.ingredients(brand_id, is_active);
create index if not exists ingredients_brand_name_idx
  on public.ingredients(brand_id, name);

create table if not exists public.ingredient_units (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  unit_id uuid references public.measurement_units(id) on delete restrict,
  unit_name text not null,
  conversion_to_base numeric(18,6) not null,
  purchase_price numeric(18,4),
  is_default_purchase_unit boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ingredient_units_conversion_positive
    check (conversion_to_base > 0),
  constraint ingredient_units_price_nonnegative
    check (purchase_price is null or purchase_price >= 0),
  constraint ingredient_units_name_unique unique (ingredient_id, unit_name)
);

alter table public.ingredient_units
  add column if not exists unit_id uuid;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ingredient_units_unit_id_fkey'
  ) then
    alter table public.ingredient_units
      add constraint ingredient_units_unit_id_fkey
      foreign key (unit_id)
      references public.measurement_units(id)
      on delete restrict;
  end if;
end;
$$;

update public.ingredient_units iu
set unit_id = u.id
from public.measurement_units u
where iu.unit_id is null
  and u.brand_id is null
  and (
    lower(u.code) = lower(iu.unit_name)
    or lower(u.symbol) = lower(iu.unit_name)
    or lower(u.name) = lower(iu.unit_name)
  );

-- Standard units must always use the system conversion. This also repairs
-- previously saved reversed values such as 1 g = 1000 kg.
update public.ingredient_units iu
set conversion_to_base =
  purchase_unit.factor_to_canonical / base_unit.factor_to_canonical
from public.ingredients ingredient
cross join public.measurement_units base_unit
cross join public.measurement_units purchase_unit
where iu.ingredient_id = ingredient.id
  and base_unit.id = ingredient.base_unit_id
  and purchase_unit.id = iu.unit_id
  and base_unit.dimension = purchase_unit.dimension
  and base_unit.factor_to_canonical is not null
  and purchase_unit.factor_to_canonical is not null;

create unique index if not exists ingredient_units_one_default
  on public.ingredient_units(ingredient_id)
  where is_default_purchase_unit;

create table if not exists public.ingredient_receipts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  invoice_number text,
  supplier_name text,
  received_at timestamptz not null default now(),
  note text,
  performed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists ingredient_receipts_brand_received_idx
  on public.ingredient_receipts(brand_id, received_at desc);
create index if not exists ingredient_receipts_brand_invoice_idx
  on public.ingredient_receipts(brand_id, invoice_number)
  where invoice_number is not null and btrim(invoice_number) <> '';

create table if not exists public.ingredient_receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null
    references public.ingredient_receipts(id) on delete cascade,
  ingredient_id uuid not null
    references public.ingredients(id) on delete restrict,
  unit_id uuid references public.measurement_units(id) on delete restrict,
  purchase_quantity numeric(18,6) not null,
  conversion_to_base numeric(18,6) not null,
  quantity_base numeric(18,6) not null,
  unit_cost numeric(18,4),
  total_cost numeric(18,4),
  created_at timestamptz not null default now(),
  constraint ingredient_receipt_items_purchase_positive
    check (purchase_quantity > 0),
  constraint ingredient_receipt_items_conversion_positive
    check (conversion_to_base > 0),
  constraint ingredient_receipt_items_base_positive
    check (quantity_base > 0),
  constraint ingredient_receipt_items_cost_nonnegative check (
    (unit_cost is null or unit_cost >= 0)
    and (total_cost is null or total_cost >= 0)
  )
);

create index if not exists ingredient_receipt_items_receipt_idx
  on public.ingredient_receipt_items(receipt_id);
create index if not exists ingredient_receipt_items_ingredient_idx
  on public.ingredient_receipt_items(ingredient_id, created_at desc);

create table if not exists public.product_recipes (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_key text not null default 'normal',
  version integer not null default 1,
  yield_quantity numeric(18,4) not null default 1,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint product_recipes_variant_check
    check (variant_key in ('normal', 'special', 'jumbo')),
  constraint product_recipes_yield_positive check (yield_quantity > 0),
  constraint product_recipes_version_positive check (version > 0),
  constraint product_recipes_effective_range
    check (effective_to is null or effective_to > effective_from),
  constraint product_recipes_version_unique
    unique (product_id, variant_key, version)
);

create unique index if not exists product_recipes_one_active
  on public.product_recipes(product_id, variant_key)
  where is_active and effective_to is null;
create index if not exists product_recipes_lookup_idx
  on public.product_recipes(brand_id, product_id, variant_key, effective_from);

create table if not exists public.product_recipe_items (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.product_recipes(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  quantity_base numeric(18,6) not null,
  waste_percent numeric(7,4) not null default 0,
  created_at timestamptz not null default now(),
  constraint product_recipe_items_quantity_positive check (quantity_base > 0),
  constraint product_recipe_items_waste_range
    check (waste_percent >= 0 and waste_percent <= 100),
  constraint product_recipe_items_unique unique (recipe_id, ingredient_id)
);

create table if not exists public.ingredient_stock_balances (
  brand_id uuid not null references public.brands(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  quantity_on_hand numeric(18,6) not null default 0,
  average_cost numeric(18,6) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (brand_id, ingredient_id)
);

create table if not exists public.ingredient_stock_movements (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  quantity_delta numeric(18,6) not null,
  movement_type text not null,
  order_id uuid references public.orders(id) on delete set null,
  order_item_id uuid references public.order_items(id) on delete set null,
  recipe_item_id uuid references public.product_recipe_items(id) on delete set null,
  receipt_id uuid references public.ingredient_receipts(id) on delete set null,
  receipt_item_id uuid
    references public.ingredient_receipt_items(id) on delete set null,
  source_event_key text not null,
  performed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  constraint ingredient_movements_nonzero check (quantity_delta <> 0),
  constraint ingredient_movements_type_check check (
    movement_type in (
      'RECEIVE',
      'SALE_CONSUMPTION',
      'ADJUST_IN',
      'ADJUST_OUT',
      'WASTE',
      'SALE_REVERSAL'
    )
  ),
  constraint ingredient_movements_event_unique unique (source_event_key)
);

alter table public.ingredient_stock_movements
  add column if not exists receipt_id uuid;
alter table public.ingredient_stock_movements
  add column if not exists receipt_item_id uuid;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ingredient_stock_movements_receipt_id_fkey'
  ) then
    alter table public.ingredient_stock_movements
      add constraint ingredient_stock_movements_receipt_id_fkey
      foreign key (receipt_id)
      references public.ingredient_receipts(id)
      on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'ingredient_stock_movements_receipt_item_id_fkey'
  ) then
    alter table public.ingredient_stock_movements
      add constraint ingredient_stock_movements_receipt_item_id_fkey
      foreign key (receipt_item_id)
      references public.ingredient_receipt_items(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists ingredient_movements_brand_created_idx
  on public.ingredient_stock_movements(brand_id, created_at desc);
create index if not exists ingredient_movements_ingredient_created_idx
  on public.ingredient_stock_movements(ingredient_id, created_at desc);
create index if not exists ingredient_movements_brand_ingredient_created_idx
  on public.ingredient_stock_movements(
    brand_id,
    ingredient_id,
    created_at desc
  );
create index if not exists ingredient_movements_order_idx
  on public.ingredient_stock_movements(order_id);

create or replace function public.apply_ingredient_movement_to_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allow_negative boolean;
  v_quantity_on_hand numeric(18,6);
begin
  select i.allow_negative
  into v_allow_negative
  from public.ingredients i
  where i.id = new.ingredient_id
    and i.brand_id = new.brand_id;

  if v_allow_negative is null then
    raise exception 'Ingredient does not belong to movement brand';
  end if;

  insert into public.ingredient_stock_balances (
    brand_id,
    ingredient_id,
    quantity_on_hand,
    updated_at
  )
  values (
    new.brand_id,
    new.ingredient_id,
    new.quantity_delta,
    now()
  )
  on conflict (brand_id, ingredient_id)
  do update set
    quantity_on_hand =
      public.ingredient_stock_balances.quantity_on_hand
      + excluded.quantity_on_hand,
    updated_at = now()
  returning quantity_on_hand into v_quantity_on_hand;

  if not v_allow_negative and v_quantity_on_hand < 0 then
    raise exception 'Insufficient ingredient stock for ingredient %',
      new.ingredient_id;
  end if;

  return new;
end;
$$;

drop trigger if exists ingredient_movement_updates_balance
  on public.ingredient_stock_movements;
create trigger ingredient_movement_updates_balance
after insert on public.ingredient_stock_movements
for each row execute function public.apply_ingredient_movement_to_balance();

create or replace function public.save_product_recipe(
  p_product_id uuid,
  p_variant_key text,
  p_yield_quantity numeric,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_brand_id uuid;
  v_recipe_id uuid;
  v_version integer;
  v_now timestamptz := clock_timestamp();
  v_inserted_count integer;
begin
  if p_variant_key not in ('normal', 'special', 'jumbo') then
    raise exception 'Invalid recipe variant';
  end if;
  if p_yield_quantity is null or p_yield_quantity <= 0 then
    raise exception 'Recipe yield must be greater than zero';
  end if;
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Recipe must contain at least one ingredient';
  end if;

  select p.brand_id
  into v_brand_id
  from public.products p
  where p.id = p_product_id
    and p.deleted_at is null;

  if v_brand_id is null then
    raise exception 'Product not found';
  end if;

  if v_brand_id <> (
    select profile.brand_id
    from public.profiles profile
    where profile.id = auth.uid()
  ) then
    raise exception 'Forbidden';
  end if;

  update public.product_recipes
  set
    is_active = false,
    effective_to = greatest(
      v_now,
      effective_from + interval '1 microsecond'
    )
  where product_id = p_product_id
    and variant_key = p_variant_key
    and is_active
    and effective_to is null;

  select coalesce(max(version), 0) + 1
  into v_version
  from public.product_recipes
  where product_id = p_product_id
    and variant_key = p_variant_key;

  insert into public.product_recipes (
    brand_id,
    product_id,
    variant_key,
    version,
    yield_quantity,
    effective_from,
    is_active
  )
  values (
    v_brand_id,
    p_product_id,
    p_variant_key,
    v_version,
    p_yield_quantity,
    v_now,
    true
  )
  returning id into v_recipe_id;

  insert into public.product_recipe_items (
    recipe_id,
    ingredient_id,
    quantity_base,
    waste_percent
  )
  select
    v_recipe_id,
    parsed.ingredient_id,
    parsed.quantity_base,
    coalesce(parsed.waste_percent, 0)
  from jsonb_to_recordset(p_items) as parsed(
    ingredient_id uuid,
    quantity_base numeric,
    waste_percent numeric
  )
  join public.ingredients ingredient
    on ingredient.id = parsed.ingredient_id
   and ingredient.brand_id = v_brand_id
   and ingredient.is_active
  where parsed.quantity_base > 0
    and coalesce(parsed.waste_percent, 0) between 0 and 100;

  get diagnostics v_inserted_count = row_count;
  if v_inserted_count <> jsonb_array_length(p_items) then
    raise exception 'One or more recipe ingredients are invalid';
  end if;

  return v_recipe_id;
end;
$$;

drop function if exists public.create_ingredient_with_units(
  text,
  text,
  text,
  text,
  numeric,
  boolean,
  jsonb
);
drop function if exists public.create_ingredient_with_units(
  text,
  text,
  uuid,
  uuid,
  numeric,
  boolean,
  jsonb
);

create function public.create_ingredient_with_units(
  p_name text,
  p_sku text,
  p_category_id uuid,
  p_base_unit_id uuid,
  p_minimum_stock numeric,
  p_allow_negative boolean,
  p_units jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_brand_id uuid;
  v_ingredient_id uuid;
  v_category_name text;
  v_base_unit_symbol text;
  v_base_unit_dimension text;
  v_base_unit_factor numeric;
  v_inserted_count integer := 0;
begin
  select profile.brand_id
  into v_brand_id
  from public.profiles profile
  where profile.id = auth.uid();

  if v_brand_id is null then
    raise exception 'No brand assigned';
  end if;
  if btrim(coalesce(p_name, '')) = '' then
    raise exception 'Ingredient name is required';
  end if;

  select c.name
  into v_category_name
  from public.ingredient_categories c
  where c.id = p_category_id
    and c.brand_id = v_brand_id
    and c.is_active;

  if p_category_id is not null and v_category_name is null then
    raise exception 'Invalid ingredient category';
  end if;

  select u.symbol, u.dimension, u.factor_to_canonical
  into v_base_unit_symbol, v_base_unit_dimension, v_base_unit_factor
  from public.measurement_units u
  where u.id = p_base_unit_id
    and u.is_active
    and (u.brand_id is null or u.brand_id = v_brand_id);

  if v_base_unit_symbol is null then
    raise exception 'Invalid base unit';
  end if;
  if p_units is null or jsonb_typeof(p_units) <> 'array' then
    p_units := '[]'::jsonb;
  end if;

  insert into public.ingredients (
    brand_id,
    name,
    sku,
    category,
    category_id,
    base_unit,
    base_unit_id,
    minimum_stock,
    allow_negative
  )
  values (
    v_brand_id,
    btrim(p_name),
    nullif(btrim(coalesce(p_sku, '')), ''),
    v_category_name,
    p_category_id,
    v_base_unit_symbol,
    p_base_unit_id,
    greatest(coalesce(p_minimum_stock, 0), 0),
    coalesce(p_allow_negative, true)
  )
  returning id into v_ingredient_id;

  if jsonb_array_length(p_units) > 0 then
    insert into public.ingredient_units (
      ingredient_id,
      unit_id,
      unit_name,
      conversion_to_base,
      purchase_price,
      is_default_purchase_unit
    )
    select
      v_ingredient_id,
      parsed.unit_id,
      unit.name,
      case
        when unit.dimension = v_base_unit_dimension
          and unit.factor_to_canonical is not null
          and v_base_unit_factor is not null
        then unit.factor_to_canonical / v_base_unit_factor
        else parsed.conversion_to_base
      end,
      parsed.purchase_price,
      coalesce(parsed.is_default_purchase_unit, false)
    from jsonb_to_recordset(p_units) as parsed(
      unit_id uuid,
      conversion_to_base numeric,
      purchase_price numeric,
      is_default_purchase_unit boolean
    )
    join public.measurement_units unit
      on unit.id = parsed.unit_id
     and unit.is_active
     and (unit.brand_id is null or unit.brand_id = v_brand_id)
    where parsed.conversion_to_base > 0
      and (
        parsed.purchase_price is null
        or parsed.purchase_price >= 0
      );

    get diagnostics v_inserted_count = row_count;
    if v_inserted_count <> jsonb_array_length(p_units) then
      raise exception 'One or more ingredient units are invalid';
    end if;
  end if;

  return v_ingredient_id;
end;
$$;

create or replace function public.receive_ingredient_batch(
  p_invoice_number text,
  p_supplier_name text,
  p_received_at timestamptz,
  p_note text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_brand_id uuid;
  v_user_id uuid := auth.uid();
  v_receipt_id uuid;
  v_receipt_item_id uuid;
  v_item jsonb;
  v_ingredient record;
  v_unit_id uuid;
  v_purchase_quantity numeric;
  v_conversion numeric;
  v_payload_conversion numeric;
  v_unit_cost numeric;
  v_quantity_base numeric;
begin
  select profile.brand_id
  into v_brand_id
  from public.profiles profile
  where profile.id = v_user_id;

  if v_brand_id is null then
    raise exception 'No brand assigned';
  end if;
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Receipt must contain at least one item';
  end if;

  insert into public.ingredient_receipts (
    brand_id,
    invoice_number,
    supplier_name,
    received_at,
    note,
    performed_by
  )
  values (
    v_brand_id,
    nullif(btrim(coalesce(p_invoice_number, '')), ''),
    nullif(btrim(coalesce(p_supplier_name, '')), ''),
    coalesce(p_received_at, now()),
    nullif(btrim(coalesce(p_note, '')), ''),
    v_user_id
  )
  returning id into v_receipt_id;

  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    v_purchase_quantity :=
      nullif(v_item->>'purchase_quantity', '')::numeric;
    v_unit_id := nullif(v_item->>'unit_id', '')::uuid;
    v_payload_conversion :=
      nullif(v_item->>'conversion_to_base', '')::numeric;
    v_unit_cost := nullif(v_item->>'unit_cost', '')::numeric;
    v_conversion := null;

    if v_purchase_quantity is null or v_purchase_quantity <= 0 then
      raise exception 'Receipt item quantity must be greater than zero';
    end if;
    if v_unit_cost is not null and v_unit_cost < 0 then
      raise exception 'Receipt item cost cannot be negative';
    end if;

    select
      ingredient.id,
      ingredient.base_unit_id,
      base_unit.dimension as base_dimension,
      base_unit.factor_to_canonical as base_factor
    into v_ingredient
    from public.ingredients ingredient
    left join public.measurement_units base_unit
      on base_unit.id = ingredient.base_unit_id
    where ingredient.id = (v_item->>'ingredient_id')::uuid
      and ingredient.brand_id = v_brand_id
      and ingredient.is_active;

    if v_ingredient.id is null then
      raise exception 'Invalid ingredient in receipt';
    end if;

    if v_unit_id is null or v_unit_id = v_ingredient.base_unit_id then
      v_conversion := 1;
    else
      select ingredient_unit.conversion_to_base
      into v_conversion
      from public.ingredient_units ingredient_unit
      where ingredient_unit.ingredient_id = v_ingredient.id
        and ingredient_unit.unit_id = v_unit_id
      limit 1;

      if v_conversion is null then
        select
          unit.factor_to_canonical / v_ingredient.base_factor
        into v_conversion
        from public.measurement_units unit
        where unit.id = v_unit_id
          and unit.is_active
          and unit.dimension = v_ingredient.base_dimension
          and unit.factor_to_canonical is not null
          and v_ingredient.base_factor is not null
          and (unit.brand_id is null or unit.brand_id = v_brand_id);
      end if;

      if v_conversion is null then
        v_conversion := v_payload_conversion;
      end if;
    end if;

    if v_conversion is null or v_conversion <= 0 then
      raise exception 'Invalid unit conversion in receipt';
    end if;

    v_quantity_base := v_purchase_quantity * v_conversion;

    insert into public.ingredient_receipt_items (
      receipt_id,
      ingredient_id,
      unit_id,
      purchase_quantity,
      conversion_to_base,
      quantity_base,
      unit_cost,
      total_cost
    )
    values (
      v_receipt_id,
      v_ingredient.id,
      v_unit_id,
      v_purchase_quantity,
      v_conversion,
      v_quantity_base,
      v_unit_cost,
      case
        when v_unit_cost is null then null
        else v_unit_cost * v_purchase_quantity
      end
    )
    returning id into v_receipt_item_id;

    insert into public.ingredient_stock_movements (
      brand_id,
      ingredient_id,
      quantity_delta,
      movement_type,
      receipt_id,
      receipt_item_id,
      source_event_key,
      performed_by,
      note,
      created_at
    )
    values (
      v_brand_id,
      v_ingredient.id,
      v_quantity_base,
      'RECEIVE',
      v_receipt_id,
      v_receipt_item_id,
      'RECEIPT:' || v_receipt_id || ':' || v_receipt_item_id,
      v_user_id,
      nullif(btrim(coalesce(p_note, '')), ''),
      coalesce(p_received_at, now())
    );
  end loop;

  return v_receipt_id;
end;
$$;

alter table public.ingredient_categories enable row level security;
alter table public.measurement_units enable row level security;
alter table public.ingredients enable row level security;
alter table public.ingredient_units enable row level security;
alter table public.ingredient_receipts enable row level security;
alter table public.ingredient_receipt_items enable row level security;
alter table public.product_recipes enable row level security;
alter table public.product_recipe_items enable row level security;
alter table public.ingredient_stock_balances enable row level security;
alter table public.ingredient_stock_movements enable row level security;

drop policy if exists ingredient_categories_same_brand
  on public.ingredient_categories;
create policy ingredient_categories_same_brand
on public.ingredient_categories
for all to authenticated
using (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
)
with check (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
);

drop policy if exists measurement_units_visible
  on public.measurement_units;
create policy measurement_units_visible
on public.measurement_units
for select to authenticated
using (
  brand_id is null
  or brand_id = (
    select p.brand_id from public.profiles p where p.id = auth.uid()
  )
);

drop policy if exists measurement_units_insert_own_brand
  on public.measurement_units;
create policy measurement_units_insert_own_brand
on public.measurement_units
for insert to authenticated
with check (
  not is_system
  and brand_id = (
    select p.brand_id from public.profiles p where p.id = auth.uid()
  )
);

drop policy if exists measurement_units_update_own_brand
  on public.measurement_units;
create policy measurement_units_update_own_brand
on public.measurement_units
for update to authenticated
using (
  not is_system
  and brand_id = (
    select p.brand_id from public.profiles p where p.id = auth.uid()
  )
)
with check (
  not is_system
  and brand_id = (
    select p.brand_id from public.profiles p where p.id = auth.uid()
  )
);

drop policy if exists ingredients_same_brand on public.ingredients;
create policy ingredients_same_brand on public.ingredients
for all to authenticated
using (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
)
with check (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
);

drop policy if exists ingredient_receipts_same_brand
  on public.ingredient_receipts;
create policy ingredient_receipts_same_brand
on public.ingredient_receipts
for all to authenticated
using (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
)
with check (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
);

drop policy if exists ingredient_receipt_items_same_brand
  on public.ingredient_receipt_items;
create policy ingredient_receipt_items_same_brand
on public.ingredient_receipt_items
for all to authenticated
using (
  exists (
    select 1
    from public.ingredient_receipts receipt
    join public.profiles profile on profile.brand_id = receipt.brand_id
    where receipt.id = receipt_id and profile.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.ingredient_receipts receipt
    join public.profiles profile on profile.brand_id = receipt.brand_id
    where receipt.id = receipt_id and profile.id = auth.uid()
  )
);

drop policy if exists ingredient_units_same_brand on public.ingredient_units;
create policy ingredient_units_same_brand on public.ingredient_units
for all to authenticated
using (
  exists (
    select 1 from public.ingredients i
    join public.profiles p on p.brand_id = i.brand_id
    where i.id = ingredient_id and p.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.ingredients i
    join public.profiles p on p.brand_id = i.brand_id
    where i.id = ingredient_id and p.id = auth.uid()
  )
);

drop policy if exists product_recipes_same_brand on public.product_recipes;
create policy product_recipes_same_brand on public.product_recipes
for all to authenticated
using (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
)
with check (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
);

drop policy if exists recipe_items_same_brand on public.product_recipe_items;
create policy recipe_items_same_brand on public.product_recipe_items
for all to authenticated
using (
  exists (
    select 1 from public.product_recipes r
    join public.profiles p on p.brand_id = r.brand_id
    where r.id = recipe_id and p.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.product_recipes r
    join public.ingredients i on i.id = ingredient_id
    join public.profiles p on p.brand_id = r.brand_id
    where r.id = recipe_id
      and i.brand_id = r.brand_id
      and p.id = auth.uid()
  )
);

drop policy if exists ingredient_balances_same_brand
  on public.ingredient_stock_balances;
create policy ingredient_balances_same_brand
on public.ingredient_stock_balances
for select to authenticated
using (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
);

drop policy if exists ingredient_movements_same_brand
  on public.ingredient_stock_movements;
create policy ingredient_movements_same_brand
on public.ingredient_stock_movements
for select to authenticated
using (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
);

drop policy if exists ingredient_movements_insert_same_brand
  on public.ingredient_stock_movements;
create policy ingredient_movements_insert_same_brand
on public.ingredient_stock_movements
for insert to authenticated
with check (
  brand_id = (select p.brand_id from public.profiles p where p.id = auth.uid())
  and exists (
    select 1
    from public.ingredients i
    where i.id = ingredient_id and i.brand_id = brand_id
  )
);

grant select, insert, update on public.ingredient_categories to authenticated;
grant select, insert, update on public.measurement_units to authenticated;
grant select, insert, update on public.ingredients to authenticated;
grant select, insert, update, delete on public.ingredient_units to authenticated;
grant select, insert, update on public.ingredient_receipts to authenticated;
grant select, insert, update on public.ingredient_receipt_items to authenticated;
grant select, insert, update on public.product_recipes to authenticated;
grant select, insert, update, delete on public.product_recipe_items to authenticated;
grant select on public.ingredient_stock_balances to authenticated;
grant select, insert on public.ingredient_stock_movements to authenticated;
grant execute on function public.save_product_recipe(
  uuid,
  text,
  numeric,
  jsonb
) to authenticated;
grant execute on function public.create_ingredient_with_units(
  text,
  text,
  uuid,
  uuid,
  numeric,
  boolean,
  jsonb
) to authenticated;
grant execute on function public.receive_ingredient_batch(
  text,
  text,
  timestamptz,
  text,
  jsonb
) to authenticated;

notify pgrst, 'reload schema';

commit;
