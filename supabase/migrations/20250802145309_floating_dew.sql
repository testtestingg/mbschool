/*
  # Create user profiles and attempts tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `created_at` (timestamp)
    - `attempts`
      - `id` (bigserial, primary key)
      - `user_id` (uuid, references auth.users)
      - `grade` (text)
      - `difficulty` (text)
      - `score` (int)
      - `accuracy` (int)
      - `best_streak` (int)
      - `total_questions` (int)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to read/write their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  created_at timestamp DEFAULT now()
);

-- Create attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  grade text,
  difficulty text,
  score int,
  accuracy int,
  best_streak int,
  total_questions int,
  created_at timestamp DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for attempts
CREATE POLICY "Users can read own attempts"
  ON attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);