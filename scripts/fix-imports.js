#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

async function fixImports(dir) {
  const files = await fs.readdir(dir, { recursive: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    
    if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      let content = await fs.readFile(fullPath, 'utf8');
      
      // Remove duplicate .js extensions
      content = content.replace(/\.js\.js/g, '.js');
      
      // Remove .js extensions from node built-ins
      const nodeBuiltins = ['node:fs', 'node:path', 'node:child_process', 'node:util', 'node:os', 'node:crypto', 'node:events', 'node:perf_hooks', 'node:fs/promises'];
      nodeBuiltins.forEach(builtin => {
        content = content.replace(new RegExp(`from '${builtin}\\.js'`, 'g'), `from '${builtin}'`);
      });
      
      await fs.writeFile(fullPath, content);
    }
  }
}

const dir = path.resolve(process.argv[2] || './src');
fixImports(dir).catch(console.error);
