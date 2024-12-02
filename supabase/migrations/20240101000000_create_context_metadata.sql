-- 创建 context_metadata 表
CREATE TABLE context_metadata (
  id SERIAL PRIMARY KEY,
  workspace_root TEXT UNIQUE NOT NULL,
  exclude_patterns TEXT[] NOT NULL,
  max_depth INTEGER NOT NULL DEFAULT 10,
  ignore_case BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_context_metadata_modtime
BEFORE UPDATE ON context_metadata
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
