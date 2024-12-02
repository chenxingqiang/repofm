-- 初始化上下文元数据的种子数据
INSERT INTO context_metadata (
  workspace_root, 
  exclude_patterns, 
  max_depth, 
  ignore_case
) VALUES 
(
  '/default/workspace', 
  ARRAY['node_modules/**', '*.log', '.git/**'], 
  10, 
  true
),
(
  '/projects/repofm', 
  ARRAY['vendor/**', 'build/**', 'dist/**'], 
  5, 
  false
)
ON CONFLICT (workspace_root) DO NOTHING;