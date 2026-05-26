import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://biaglhmfvqootcgragbd.supabase.co';
const supabaseKey = 'sb_publishable__M0q_iSfI3u7ilJ3tv6tDQ_HCialKzJ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Attempting to insert 'Unknown' IP...");
  const { data, error } = await supabase
    .from('surveys')
    .insert([{
      id: '11111111-0000-0000-0000-000000000000',
      survey_data: { test: true },
      ip_address: 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    }]);
  
  if (error) {
    console.error("INSERT ERROR:", error);
  } else {
    console.log("INSERT SUCCESS!", data);
  }
}

test();
