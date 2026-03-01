const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
        *,
        profiles ( email ),
        order_items (
            id,
            quantity,
            price_at_time,
            products ( name, image_url )
        )
    `)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS:', JSON.stringify(data, null, 2));
  }
}
run();
