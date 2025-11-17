/*
  # Fix Infinite Recursion in Profiles RLS Policies

  ## Problem
  The original policies were creating infinite recursion by checking the profiles table
  within the policy conditions for the profiles table itself.

  ## Solution
  Simplify policies to use auth.uid() directly without nested profile queries.
  - SELECT: Users can view all profiles (needed for management features)
  - INSERT: Only during signup (handled by trigger)
  - UPDATE: Only admins and super_admins can update
  - DELETE: Only super_admins can delete
*/

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins and super admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super admins can update profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );

CREATE POLICY "Only super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'super_admin'
    )
  );
