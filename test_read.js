import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://biaglhmfvqootcgragbd.supabase.co';
const supabaseKey = 'sb_publishable__M0q_iSfI3u7ilJ3tv6tDQ_HCialKzJ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRead() {
  console.log("Attempting to read surveys anonymously (should fail or return 0)...");
  const { data, error } = await supabase.from('surveys').select('id').limit(5);
  console.log("Anon Data length:", data?.length, "Error:", error?.message);

  // Let's try to authenticate using the user's email if possible, or just check what's going on.
  // Wait, I can't authenticate without password.
}

testRead();
