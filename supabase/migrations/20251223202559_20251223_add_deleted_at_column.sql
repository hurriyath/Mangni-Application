/*
  # Add deleted_at column to profiles table
  
  1. New Columns
    - `deleted_at` (timestamp) - tracks when a profile was soft-deleted
  
  2. Changes
    - Adds deleted_at column to profiles table for audit trail
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;