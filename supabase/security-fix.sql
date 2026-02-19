-- DirtBoard Security Fix
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/uwmxejewudmhvabrhqps/sql

-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allows all access for MVP - you're the only user)
CREATE POLICY "Allow all access to properties" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to comps" ON comps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to saved_views" ON saved_views FOR ALL USING (true) WITH CHECK (true);

-- Done! This enables RLS but allows all operations.
-- For production, you'd want stricter policies based on user auth.
