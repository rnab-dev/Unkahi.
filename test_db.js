import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://biaglhmfvqootcgragbd.supabase.co';
const supabaseKey = 'sb_publishable__M0q_iSfI3u7ilJ3tv6tDQ_HCialKzJ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Fetching surveys...");
  const { data, error } = await supabase.from('surveys').select('id').limit(5);
  console.log("Surveys Data:", data);
  if (error) console.error("Error:", error);
}

test();
