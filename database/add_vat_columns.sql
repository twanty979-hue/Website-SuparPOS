-- Comprehensive VAT snapshot support for POS payments and dashboard summaries.
-- Run this once in Supabase SQL Editor after deploying the app/backend changes.

-- 1) Store the immutable VAT snapshot on each payment.
ALTER TABLE public.pai_orders ADD COLUMN IF NOT EXISTS subtotal_before_vat numeric not null default 0;
ALTER TABLE public.pai_orders ADD COLUMN IF NOT EXISTS vat_rate numeric not null default 0;
ALTER TABLE public.pai_orders ADD COLUMN IF NOT EXISTS vat_mode text not null default 'none';
ALTER TABLE public.pai_orders ADD COLUMN IF NOT EXISTS vat_amount numeric not null default 0;
ALTER TABLE public.pai_orders ADD COLUMN IF NOT EXISTS total_with_vat numeric not null default 0;
ALTER TABLE public.pai_orders ADD COLUMN IF NOT EXISTS vat_snapshot jsonb not null default '{}'::jsonb;

ALTER TABLE public.pai_orders
  DROP CONSTRAINT IF EXISTS pai_orders_vat_mode_check;
ALTER TABLE public.pai_orders
  ADD CONSTRAINT pai_orders_vat_mode_check
  CHECK (vat_mode IN ('none', 'included', 'excluded'));

UPDATE public.pai_orders
SET
  subtotal_before_vat = CASE
    WHEN COALESCE(subtotal_before_vat, 0) = 0 THEN COALESCE(total_amount, 0)
    ELSE subtotal_before_vat
  END,
  total_with_vat = CASE
    WHEN COALESCE(total_with_vat, 0) = 0 THEN COALESCE(total_amount, 0)
    ELSE total_with_vat
  END,
  vat_mode = CASE
    WHEN COALESCE(vat_rate, 0) <= 0 THEN 'none'
    WHEN vat_mode IN ('included', 'excluded') THEN vat_mode
    ELSE 'included'
  END,
  vat_snapshot = CASE
    WHEN vat_snapshot = '{}'::jsonb THEN jsonb_build_object(
      'subtotal_before_vat', CASE WHEN COALESCE(subtotal_before_vat, 0) = 0 THEN COALESCE(total_amount, 0) ELSE subtotal_before_vat END,
      'vat_rate', COALESCE(vat_rate, 0),
      'vat_mode', CASE WHEN COALESCE(vat_rate, 0) <= 0 THEN 'none' WHEN vat_mode IN ('included', 'excluded') THEN vat_mode ELSE 'included' END,
      'vat_amount', COALESCE(vat_amount, 0),
      'total_with_vat', CASE WHEN COALESCE(total_with_vat, 0) = 0 THEN COALESCE(total_amount, 0) ELSE total_with_vat END
    )
    ELSE vat_snapshot
  END;

-- 2) Add aggregate VAT columns to the 5 dashboard summary tables.
-- total_payments is used by the current triggers; keep this migration safe for
-- databases that have not run older dashboard-total migrations yet.
ALTER TABLE public.dashboard_daily_sales ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;
ALTER TABLE public.dashboard_daily_sales ADD COLUMN IF NOT EXISTS subtotal_before_vat numeric not null default 0;
ALTER TABLE public.dashboard_daily_sales ADD COLUMN IF NOT EXISTS vat_amount numeric not null default 0;
ALTER TABLE public.dashboard_daily_sales ADD COLUMN IF NOT EXISTS total_with_vat numeric not null default 0;

ALTER TABLE public.dashboard_hourly_sales ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;
ALTER TABLE public.dashboard_hourly_sales ADD COLUMN IF NOT EXISTS subtotal_before_vat numeric not null default 0;
ALTER TABLE public.dashboard_hourly_sales ADD COLUMN IF NOT EXISTS vat_amount numeric not null default 0;
ALTER TABLE public.dashboard_hourly_sales ADD COLUMN IF NOT EXISTS total_with_vat numeric not null default 0;

ALTER TABLE public.dashboard_payment_stats ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;
ALTER TABLE public.dashboard_payment_stats ADD COLUMN IF NOT EXISTS subtotal_before_vat numeric not null default 0;
ALTER TABLE public.dashboard_payment_stats ADD COLUMN IF NOT EXISTS vat_amount numeric not null default 0;
ALTER TABLE public.dashboard_payment_stats ADD COLUMN IF NOT EXISTS total_with_vat numeric not null default 0;

ALTER TABLE public.dashboard_table_stats ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;
ALTER TABLE public.dashboard_table_stats ADD COLUMN IF NOT EXISTS subtotal_before_vat numeric not null default 0;
ALTER TABLE public.dashboard_table_stats ADD COLUMN IF NOT EXISTS vat_amount numeric not null default 0;
ALTER TABLE public.dashboard_table_stats ADD COLUMN IF NOT EXISTS total_with_vat numeric not null default 0;

ALTER TABLE public.dashboard_cashier_stats ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;
ALTER TABLE public.dashboard_cashier_stats ADD COLUMN IF NOT EXISTS subtotal_before_vat numeric not null default 0;
ALTER TABLE public.dashboard_cashier_stats ADD COLUMN IF NOT EXISTS vat_amount numeric not null default 0;
ALTER TABLE public.dashboard_cashier_stats ADD COLUMN IF NOT EXISTS total_with_vat numeric not null default 0;

-- 3) Backfill only VAT aggregate columns from immutable pai_orders snapshots.
WITH payment_vat AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date AS report_date,
    SUM(COALESCE(payment.subtotal_before_vat, payment.total_amount, 0)) AS subtotal_before_vat,
    SUM(COALESCE(payment.vat_amount, 0)) AS vat_amount,
    SUM(COALESCE(payment.total_with_vat, payment.total_amount, 0)) AS total_with_vat
  FROM public.pai_orders AS payment
  JOIN public.brands AS brand ON brand.id = payment.brand_id
  GROUP BY payment.brand_id, (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date
)
UPDATE public.dashboard_daily_sales d
SET
  subtotal_before_vat = pv.subtotal_before_vat,
  vat_amount = pv.vat_amount,
  total_with_vat = pv.total_with_vat,
  updated_at = now()
FROM payment_vat pv
WHERE d.brand_id = pv.brand_id AND d.report_date = pv.report_date;

WITH hourly_vat AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date AS report_date,
    EXTRACT(HOUR FROM (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok')))::integer AS report_hour,
    SUM(COALESCE(payment.subtotal_before_vat, payment.total_amount, 0)) AS subtotal_before_vat,
    SUM(COALESCE(payment.vat_amount, 0)) AS vat_amount,
    SUM(COALESCE(payment.total_with_vat, payment.total_amount, 0)) AS total_with_vat
  FROM public.pai_orders AS payment
  JOIN public.brands AS brand ON brand.id = payment.brand_id
  GROUP BY payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date,
    EXTRACT(HOUR FROM (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok')))
)
UPDATE public.dashboard_hourly_sales d
SET
  subtotal_before_vat = hv.subtotal_before_vat,
  vat_amount = hv.vat_amount,
  total_with_vat = hv.total_with_vat,
  updated_at = now()
FROM hourly_vat hv
WHERE d.brand_id = hv.brand_id AND d.report_date = hv.report_date AND d.report_hour = hv.report_hour;

WITH payment_method_vat AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date AS report_date,
    LOWER(payment.payment_method) AS payment_method,
    SUM(COALESCE(payment.subtotal_before_vat, payment.total_amount, 0)) AS subtotal_before_vat,
    SUM(COALESCE(payment.vat_amount, 0)) AS vat_amount,
    SUM(COALESCE(payment.total_with_vat, payment.total_amount, 0)) AS total_with_vat
  FROM public.pai_orders AS payment
  JOIN public.brands AS brand ON brand.id = payment.brand_id
  GROUP BY payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date,
    LOWER(payment.payment_method)
)
UPDATE public.dashboard_payment_stats d
SET
  subtotal_before_vat = pmv.subtotal_before_vat,
  vat_amount = pmv.vat_amount,
  total_with_vat = pmv.total_with_vat,
  updated_at = now()
FROM payment_method_vat pmv
WHERE d.brand_id = pmv.brand_id AND d.report_date = pmv.report_date AND LOWER(d.payment_method) = pmv.payment_method;

WITH table_vat AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date AS report_date,
    orders.type AS order_type,
    COALESCE(orders.table_label, '') AS table_label,
    SUM(COALESCE(payment.subtotal_before_vat, payment.total_amount, 0)) AS subtotal_before_vat,
    SUM(COALESCE(payment.vat_amount, 0)) AS vat_amount,
    SUM(COALESCE(payment.total_with_vat, payment.total_amount, 0)) AS total_with_vat
  FROM public.pai_orders AS payment
  JOIN public.brands AS brand ON brand.id = payment.brand_id
  JOIN public.orders AS orders ON orders.id = payment.order_id
  GROUP BY payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date,
    orders.type,
    COALESCE(orders.table_label, '')
)
UPDATE public.dashboard_table_stats d
SET
  subtotal_before_vat = tv.subtotal_before_vat,
  vat_amount = tv.vat_amount,
  total_with_vat = tv.total_with_vat,
  updated_at = now()
FROM table_vat tv
WHERE d.brand_id = tv.brand_id
  AND d.report_date = tv.report_date
  AND d.order_type = tv.order_type
  AND d.table_label = tv.table_label;

WITH cashier_vat AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date AS report_date,
    payment.cashier_id,
    SUM(COALESCE(payment.subtotal_before_vat, payment.total_amount, 0)) AS subtotal_before_vat,
    SUM(COALESCE(payment.vat_amount, 0)) AS vat_amount,
    SUM(COALESCE(payment.total_with_vat, payment.total_amount, 0)) AS total_with_vat
  FROM public.pai_orders AS payment
  JOIN public.brands AS brand ON brand.id = payment.brand_id
  WHERE payment.cashier_id IS NOT NULL
  GROUP BY payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date,
    payment.cashier_id
)
UPDATE public.dashboard_cashier_stats d
SET
  subtotal_before_vat = cv.subtotal_before_vat,
  vat_amount = cv.vat_amount,
  total_with_vat = cv.total_with_vat,
  updated_at = now()
FROM cashier_vat cv
WHERE d.brand_id = cv.brand_id AND d.report_date = cv.report_date AND d.cashier_id = cv.cashier_id;

-- 4) Patch dashboard trigger functions so future payments aggregate VAT snapshots.
CREATE OR REPLACE FUNCTION public.update_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_timezone text;
  v_report_date date;
  v_payment_method text;
BEGIN
  IF NEW.brand_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT timezone INTO v_timezone FROM public.brands WHERE id = NEW.brand_id;
  IF v_timezone IS NULL THEN
    v_timezone := 'Asia/Bangkok';
  END IF;

  v_report_date := (NEW.created_at AT TIME ZONE v_timezone)::date;
  v_payment_method := lower(COALESCE(NEW.payment_method, ''));

  INSERT INTO public.dashboard_daily_sales (
    brand_id,
    report_date,
    total_revenue,
    total_payments,
    total_cash,
    total_transfer,
    subtotal_before_vat,
    vat_amount,
    total_with_vat,
    updated_at
  )
  VALUES (
    NEW.brand_id,
    v_report_date,
    COALESCE(NEW.total_amount, 0),
    1,
    CASE WHEN v_payment_method = 'cash' THEN COALESCE(NEW.total_amount, 0) ELSE 0 END,
    CASE WHEN v_payment_method IN ('transfer', 'promptpay') THEN COALESCE(NEW.total_amount, 0) ELSE 0 END,
    COALESCE(NEW.subtotal_before_vat, NEW.total_amount, 0),
    COALESCE(NEW.vat_amount, 0),
    COALESCE(NEW.total_with_vat, NEW.total_amount, 0),
    now()
  )
  ON CONFLICT (brand_id, report_date)
  DO UPDATE SET
    total_revenue = dashboard_daily_sales.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_daily_sales.total_payments + 1,
    total_cash = dashboard_daily_sales.total_cash + EXCLUDED.total_cash,
    total_transfer = dashboard_daily_sales.total_transfer + EXCLUDED.total_transfer,
    subtotal_before_vat = dashboard_daily_sales.subtotal_before_vat + EXCLUDED.subtotal_before_vat,
    vat_amount = dashboard_daily_sales.vat_amount + EXCLUDED.vat_amount,
    total_with_vat = dashboard_daily_sales.total_with_vat + EXCLUDED.total_with_vat,
    updated_at = now();

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_advanced_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_timezone text;
  v_local_time timestamp;
  v_report_date date;
  v_report_hour integer;
  v_order_type text;
  v_table_label text;
  v_payment_method text;
  item record;
BEGIN
  IF NEW.brand_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT timezone INTO v_timezone FROM public.brands WHERE id = NEW.brand_id;
  IF v_timezone IS NULL THEN v_timezone := 'Asia/Bangkok'; END IF;

  v_local_time := NEW.created_at AT TIME ZONE v_timezone;
  v_report_date := v_local_time::date;
  v_report_hour := extract(hour from v_local_time)::integer;
  v_payment_method := lower(COALESCE(NEW.payment_method, ''));

  INSERT INTO public.dashboard_hourly_sales (
    brand_id, report_date, report_hour, total_revenue, total_payments,
    subtotal_before_vat, vat_amount, total_with_vat, updated_at
  )
  VALUES (
    NEW.brand_id, v_report_date, v_report_hour, COALESCE(NEW.total_amount, 0), 1,
    COALESCE(NEW.subtotal_before_vat, NEW.total_amount, 0),
    COALESCE(NEW.vat_amount, 0),
    COALESCE(NEW.total_with_vat, NEW.total_amount, 0),
    now()
  )
  ON CONFLICT (brand_id, report_date, report_hour)
  DO UPDATE SET
    total_revenue = dashboard_hourly_sales.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_hourly_sales.total_payments + 1,
    subtotal_before_vat = dashboard_hourly_sales.subtotal_before_vat + EXCLUDED.subtotal_before_vat,
    vat_amount = dashboard_hourly_sales.vat_amount + EXCLUDED.vat_amount,
    total_with_vat = dashboard_hourly_sales.total_with_vat + EXCLUDED.total_with_vat,
    updated_at = now();

  INSERT INTO public.dashboard_payment_stats (
    brand_id, report_date, payment_method, total_revenue, total_payments,
    subtotal_before_vat, vat_amount, total_with_vat, updated_at
  )
  VALUES (
    NEW.brand_id, v_report_date, v_payment_method, COALESCE(NEW.total_amount, 0), 1,
    COALESCE(NEW.subtotal_before_vat, NEW.total_amount, 0),
    COALESCE(NEW.vat_amount, 0),
    COALESCE(NEW.total_with_vat, NEW.total_amount, 0),
    now()
  )
  ON CONFLICT (brand_id, report_date, payment_method)
  DO UPDATE SET
    total_revenue = dashboard_payment_stats.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_payment_stats.total_payments + 1,
    subtotal_before_vat = dashboard_payment_stats.subtotal_before_vat + EXCLUDED.subtotal_before_vat,
    vat_amount = dashboard_payment_stats.vat_amount + EXCLUDED.vat_amount,
    total_with_vat = dashboard_payment_stats.total_with_vat + EXCLUDED.total_with_vat,
    updated_at = now();

  IF NEW.cashier_id IS NOT NULL THEN
    INSERT INTO public.dashboard_cashier_stats (
      brand_id, report_date, cashier_id, total_revenue, total_payments,
      subtotal_before_vat, vat_amount, total_with_vat, updated_at
    )
    VALUES (
      NEW.brand_id, v_report_date, NEW.cashier_id, COALESCE(NEW.total_amount, 0), 1,
      COALESCE(NEW.subtotal_before_vat, NEW.total_amount, 0),
      COALESCE(NEW.vat_amount, 0),
      COALESCE(NEW.total_with_vat, NEW.total_amount, 0),
      now()
    )
    ON CONFLICT (brand_id, report_date, cashier_id)
    DO UPDATE SET
      total_revenue = dashboard_cashier_stats.total_revenue + EXCLUDED.total_revenue,
      total_payments = dashboard_cashier_stats.total_payments + 1,
      subtotal_before_vat = dashboard_cashier_stats.subtotal_before_vat + EXCLUDED.subtotal_before_vat,
      vat_amount = dashboard_cashier_stats.vat_amount + EXCLUDED.vat_amount,
      total_with_vat = dashboard_cashier_stats.total_with_vat + EXCLUDED.total_with_vat,
      updated_at = now();
  END IF;

  SELECT type, table_label INTO v_order_type, v_table_label
  FROM public.orders WHERE id = NEW.order_id;

  IF v_order_type IS NOT NULL THEN
    INSERT INTO public.dashboard_table_stats (
      brand_id, report_date, order_type, table_label, total_revenue, total_payments,
      subtotal_before_vat, vat_amount, total_with_vat, updated_at
    )
    VALUES (
      NEW.brand_id, v_report_date, v_order_type, COALESCE(v_table_label, ''), COALESCE(NEW.total_amount, 0), 1,
      COALESCE(NEW.subtotal_before_vat, NEW.total_amount, 0),
      COALESCE(NEW.vat_amount, 0),
      COALESCE(NEW.total_with_vat, NEW.total_amount, 0),
      now()
    )
    ON CONFLICT (brand_id, report_date, order_type, table_label)
    DO UPDATE SET
      total_revenue = dashboard_table_stats.total_revenue + EXCLUDED.total_revenue,
      total_payments = dashboard_table_stats.total_payments + 1,
      subtotal_before_vat = dashboard_table_stats.subtotal_before_vat + EXCLUDED.subtotal_before_vat,
      vat_amount = dashboard_table_stats.vat_amount + EXCLUDED.vat_amount,
      total_with_vat = dashboard_table_stats.total_with_vat + EXCLUDED.total_with_vat,
      updated_at = now();
  END IF;

  FOR item IN
    SELECT product_id, product_name, quantity, price, discount
    FROM public.order_items
    WHERE order_id = NEW.order_id
  LOOP
    INSERT INTO public.dashboard_product_stats (
      brand_id, report_date, product_id, product_name, total_quantity, total_revenue, updated_at
    ) VALUES (
      NEW.brand_id,
      v_report_date,
      item.product_id,
      COALESCE(item.product_name, 'Unknown'),
      item.quantity,
      (item.quantity * item.price) - COALESCE(item.discount, 0),
      now()
    )
    ON CONFLICT (brand_id, report_date, product_id)
    DO UPDATE SET
      total_quantity = dashboard_product_stats.total_quantity + EXCLUDED.total_quantity,
      total_revenue = dashboard_product_stats.total_revenue + EXCLUDED.total_revenue,
      updated_at = now();
  END LOOP;

  RETURN NEW;
END;
$function$;
