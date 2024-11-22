# repofm Enhanced Auto-Commit

## 概述

Enhanced Auto-Commit 是 repofm 的一个强大功能，它提供了智能的提交管理、代码分析和团队协作功能。本文档详细介绍了所有可用功能及其使用方法。

## 功能特性

### 1. 智能提交管理

#### 1.1 文件分析与分类

```bash
# 查看变更文件的智能分析
repofm commit analyze

# 按类型分组显示变更
repofm commit list --group-by type

# 显示详细的文件分析
repofm commit analyze --detailed
```

输出示例：

```
📊 Changes Analysis
├── 🔵 Components (3 files)
│   ├── src/components/Button.jsx
│   ├── src/components/Form.tsx
│   └── src/components/Modal.tsx
├── 🎨 Styles (2 files)
│   ├── src/styles/main.scss
│   └── src/styles/components.css
└── 📝 Documentation (1 file)
    └── docs/API.md
```

#### 1.2 智能提交消息生成

```bash
# 使用AI辅助生成提交消息
repofm commit message --ai

# 基于模板生成提交消息
repofm commit message --template feature

# 交互式消息构建
repofm commit message --interactive
```

消息模板示例：

```
feat(ui): implement responsive Button component
- Add new design tokens
- Implement mobile-first approach
- Add accessibility features

BREAKING CHANGE: Button API has been updated
- `size` prop now accepts 'sm' | 'md' | 'lg'
- Removed deprecated `width` prop
```

### 2. 增强的交互功能

#### 2.1 可视化差异查看

```bash
# 启动交互式差异查看器
repofm commit diff

# 查看特定文件的变更
repofm commit diff src/components/Button.jsx

# 并排对比模式
repofm commit diff --side-by-side
```

#### 2.2 分阶段提交

```bash
# 交互式暂存
repofm commit stage

# 选择性暂存代码块
repofm commit stage --interactive

# 编辑暂存块
repofm commit stage --edit
```

### 3. 团队协作功能

#### 3.1 Issue 追踪集成

```bash
# 链接到 Jira issue
repofm commit --jira PROJ-123

# 链接到 GitHub issue
repofm commit --issue #456

# 自动生成 issue 链接
repofm commit --link-issues
```

配置示例：

```json
{
  "issueTracking": {
    "jira": {
      "url": "https://your-company.atlassian.net",
      "projectKey": "PROJ"
    },
    "github": {
      "repo": "owner/repo"
    }
  }
}
```

#### 3.2 代码审查集成

```bash
# 创建拉取请求
repofm commit --create-pr

# 添加审查者
repofm commit --reviewers @john @jane

# 自动标签
repofm commit --labels feature,ui
```

### 4. 代码分析功能

#### 4.1 代码质量检查

```bash
# 运行代码质量检查
repofm commit analyze --lint

# 检查潜在问题
repofm commit analyze --potential-issues

# 性能影响分析
repofm commit analyze --performance
```

分析报告示例：

```
🔍 Code Analysis Report
├── Quality Metrics
│   ├── Complexity: Low
│   ├── Maintainability: A
│   └── Test Coverage: 85%
├── Potential Issues
│   ├── Warning: Unused variable in Button.jsx
│   └── Info: Consider memoization in Form.tsx
└── Performance Impact
    ├── Bundle Size: +0.5kb
    └── Runtime: Minimal impact
```

#### 4.2 依赖分析

```bash
# 检查依赖影响
repofm commit analyze --dependencies

# 查看依赖图
repofm commit analyze --dep-graph

# 安全漏洞检查
repofm commit analyze --security
```

### 5. Git 历史可视化

```bash
# 查看提交历史图表
repofm commit history --graph

# 分析提交模式
repofm commit history --patterns

# 生成变更报告
repofm commit history --report
```

## 配置选项

完整的配置示例：

```json
{
  "autoCommit": {
    "ui": {
      "useEmoji": true,
      "showHints": true,
      "detailedDiff": true,
      "theme": "dark"
    },
    "commit": {
      "conventionalCommits": true,
      "scope": {
        "required": true,
        "suggestions": ["ui", "api", "core"]
      },
      "validation": {
        "messageLength": {
          "header": 72,
          "description": 500
        }
      }
    },
    "analysis": {
      "ai": {
        "enabled": true,
        "model": "gpt-4"
      },
      "linting": {
        "enabled": true,
        "config": ".eslintrc"
      }
    },
    "integration": {
      "jira": {
        "enabled": true,
        "required": false
      },
      "github": {
        "enabled": true,
        "autolink": true
      }
    },
    "templates": {
      "feature": {
        "add": "feat({}): add {} functionality",
        "update": "feat({}): update {} implementation"
      }
    }
  }
}
```

## 使用最佳实践

### 1. 提交消息

- 使用约定式提交规范
- 包含明确的范围
- 提供清晰的描述
- 标注破坏性变更

### 2. 代码审查

- 使用交互式暂存进行逻辑分组
- 添加适当的审查者
- 包含测试覆盖
- 链接相关问题

### 3. 团队协作

- 保持issue追踪更新
- 使用适当的标签
- 遵循团队约定
- 提供充分的上下文

### 4. 代码质量

- 定期运行代码分析
- 关注性能影响
- 维护依赖健康
- 处理安全问题

## 常见问题解决

1. **提交消息格式错误**

```bash
# 检查提交消息格式
repofm commit verify-message

# 自动修复格式问题
repofm commit fix-message
```

2. **合并冲突处理**

```bash
# 交互式合并工具
repofm commit merge --interactive

# 查看冲突详情
repofm commit conflicts
```

3. **性能问题**

```bash
# 优化大型仓库性能
repofm commit --optimize

# 清理缓存
repofm commit clean-cache
```

## 扩展和集成

### 1. 自定义插件

```javascript
// custom-plugin.js
module.exports = {
  name: 'custom-commit-plugin',
  hooks: {
    beforeCommit: async (context) => {
      // 自定义逻辑
    }
  }
};
```

### 2. CI/CD 集成

```yaml
# .github/workflows/commit-check.yml
name: Commit Check
on: [push]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Verify Commit
        run: repofm commit verify
```

## 更新日志

### v2.0.0

- ✨ 添加 AI 辅助提交消息生成
- 🎨 改进可视化差异查看器
- 🔗 增加 Jira/GitHub 集成
- 📊 新增代码分析功能
- 🤝 添加团队协作特性

## 后续规划

1. **AI 增强**
   - 更智能的代码分析
   - 自动问题检测
   - 提交消息优化

2. **团队功能**
   - 团队配置同步
   - 代码审查工作流
   - 自动化报告

3. **性能优化**
   - 更快的文件分析
   - 增量缓存
   - 并行处理
