-- Git command history table
CREATE TABLE git_command_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  command_type TEXT NOT NULL,
  repository_path TEXT NOT NULL,
  repository_name TEXT NOT NULL,
  command_details JSONB NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL
);

-- Repository metadata table
CREATE TABLE repository_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  repository_path TEXT UNIQUE NOT NULL,
  repository_name TEXT NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_commits INTEGER DEFAULT 0,
  total_pushes INTEGER DEFAULT 0
);
