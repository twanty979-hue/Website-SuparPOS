const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
    env[key] = val;
  }
});

const supabaseAdmin = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function run() {
  const brandId = 'df3929db-e8b6-4ab7-953e-9981e7be734c';
  console.log("Checking brand in db...", brandId);
  const { data: brand, error } = await supabaseAdmin
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();
  if (error) {
    console.error("Error querying brand:", error.message);
  } else {
    console.log("Brand plan:", brand.plan);
    console.log("Expiry basic:", brand.expiry_basic);
    console.log("Expiry pro:", brand.expiry_pro);
    console.log("Coins:", brand.coins);
  }
  
  console.log("Checking payment logs...");
  const { data: logs, error: logsError } = await supabaseAdmin
    .from('payment_logs')
    .select('*')
    .eq('brand_id', brandId);
  if (logsError) {
    console.error("Error querying payment logs:", logsError.message);
  } else {
    console.log("Payment logs count:", logs.length);
    console.log("Logs:", logs);
  }
}

run();
