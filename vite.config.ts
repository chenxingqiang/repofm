import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    // 添加外部依赖配置
    deps: {
      external: [
        'istextorbinary',
        'cli-spinners',
        '@babel/parser',
        'p-map',
        'inquirer'
      ]
    }
  }
}); 