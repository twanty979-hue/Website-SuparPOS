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
  console.log("Checking database tables...");
  
  // Try querying system_settings
  try {
    const { data: tables, error } = await supabaseAdmin
      .from('system_settings')
      .select('*');
    if (error) {
      console.log("system_settings error:", error.message);
    } else {
      console.log("system_settings data:", tables);
    }
  } catch (e) {
    console.error(e);
  }

  // Try querying app_settings or configuration tables
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('*');
    if (error) {
      console.log("app_settings error:", error.message);
    } else {
      console.log("app_settings data:", data);
    }
  } catch (e) {
    console.error(e);
  }
}

run();
