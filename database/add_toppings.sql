-- Central topping system for food products.
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.topping_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'multiple',
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT topping_groups_type_check CHECK (type IN ('single', 'multiple'))
);

CREATE TABLE IF NOT EXISTS public.topping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.topping_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_name text,
  price numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_topping_groups (
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.topping_groups(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, group_id)
);

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS toppings_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.topping_items
  ADD COLUMN IF NOT EXISTS image_name text;

CREATE TABLE IF NOT EXISTS public.order_item_toppings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  product_id text,
  product_name text,
  group_id uuid,
  group_name text NOT NULL,
  topping_id uuid,
  topping_name text NOT NULL,
  unit_price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  total_amount numeric NOT NULL DEFAULT 0,
  source_event_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_event_key)
);

CREATE TABLE IF NOT EXISTS public.dashboard_topping_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  topping_id uuid,
  topping_name text NOT NULL,
  total_quantity integer NOT NULL DEFAULT 0,
  total_revenue numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, report_date, topping_name)
);

CREATE INDEX IF NOT EXISTS idx_topping_groups_brand
  ON public.topping_groups(brand_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_topping_items_group
  ON public.topping_items(group_id, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_topping_groups_brand_product
  ON public.product_topping_groups(brand_id, product_id);
CREATE INDEX IF NOT EXISTS idx_order_item_toppings_brand_date
  ON public.order_item_toppings(brand_id, created_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_topping_stats_brand_date
  ON public.dashboard_topping_stats(brand_id, report_date);

CREATE OR REPLACE FUNCTION public.rebuild_dashboard_topping_stats(
  p_brand_id uuid,
  p_report_date date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF p_report_date IS NULL THEN
    DELETE FROM public.dashboard_topping_stats WHERE brand_id = p_brand_id;
  ELSE
    DELETE FROM public.dashboard_topping_stats
    WHERE brand_id = p_brand_id AND report_date = p_report_date;
  END IF;

  INSERT INTO public.dashboard_topping_stats (
    brand_id,
    report_date,
    topping_id,
    topping_name,
    total_quantity,
    total_revenue,
    updated_at
  )
  SELECT
    oit.brand_id,
    (oit.created_at AT TIME ZONE COALESCE(b.timezone, 'Asia/Bangkok'))::date AS report_date,
    MAX(oit.topping_id) AS topping_id,
    oit.topping_name,
    SUM(oit.quantity)::integer AS total_quantity,
    SUM(oit.total_amount) AS total_revenue,
    now()
  FROM public.order_item_toppings oit
  JOIN public.brands b ON b.id = oit.brand_id
  WHERE oit.brand_id = p_brand_id
    AND (
      p_report_date IS NULL
      OR (oit.created_at AT TIME ZONE COALESCE(b.timezone, 'Asia/Bangkok'))::date = p_report_date
    )
  GROUP BY
    oit.brand_id,
    (oit.created_at AT TIME ZONE COALESCE(b.timezone, 'Asia/Bangkok'))::date,
    oit.topping_name;
END;
$function$;
