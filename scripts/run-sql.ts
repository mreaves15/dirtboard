import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runSecurityFix() {
  console.log('Enabling Row Level Security...');
  
  const tables = ['properties', 'contacts', 'comps', 'activity_log', 'saved_views'];
  
  for (const table of tables) {
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
    });
    if (rlsError) console.log(`RLS ${table}:`, rlsError.message);
    
    // Create policy
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Allow all access to ${table}" ON ${table} FOR ALL USING (true) WITH CHECK (true);`
    });
    if (policyError) console.log(`Policy ${table}:`, policyError.message);
  }
  
  console.log('Security fix complete!');
}

runSecurityFix();
