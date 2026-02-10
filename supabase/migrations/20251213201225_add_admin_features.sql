/*
  # Add Admin Dashboard Features

  1. New Columns
    - `status` - Profile status (pending, approved, rejected)
    - `rejection_reason` - Reason for profile rejection
    - `rejected_at` - When profile was rejected
    - `is_deleted` - Soft delete flag

  2. Changes Made
    - Added status field with default 'pending'
    - Added rejection_reason field (nullable)
    - Added rejected_at timestamp (nullable)
    - Added is_deleted boolean with default false
    - Status tracks: pending (new), approved (approved), rejected (rejected)

  3. Data Migration
    - Existing approved = true → status = 'approved'
    - Existing approved = false → status = 'pending'
    - All new profiles default to status = 'pending'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN status text DEFAULT 'pending';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rejection_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'rejected_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN rejected_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

UPDATE profiles SET status = 'approved' WHERE approved = true;
UPDATE profiles SET status = 'pending' WHERE approved = false OR approved IS NULL;
