const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function alterDb() {
  const { error } = await supabase.rpc('execute_sql', {
    sql_query: "ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS image_alignment text DEFAULT 'right';"
  });
  if (error) console.log('RPC failed:', error.message);
  
  // Try selecting to see if it exists
  const { data, error: selectErr } = await supabase.from('carousel_slides').select('image_alignment').limit(1);
  console.log('Select test:', selectErr ? selectErr.message : 'Success: ' + JSON.stringify(data));
}
alterDb();
