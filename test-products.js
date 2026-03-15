const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock, is_active, category, series')
    .limit(10);
    
  console.log("Error:", error);
  console.log("Data total length:", data?.length);
  console.log("Raw Data:", data);
}
run();
