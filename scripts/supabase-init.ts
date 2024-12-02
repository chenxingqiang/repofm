#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';

// 加载环境变量
dotenv.config();

async function initSupabaseProject() {
  program
    .version('1.0.0')
    .description('Initialize Supabase project for repofm')
    .option('-u, --url <url>', 'Supabase project URL')
    .option('-k, --key <key>', 'Supabase anon key')
    .parse(process.argv);

  const options = program.opts();
  
  // 交互式配置
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter Supabase project URL:',
      default: options.url || process.env.SUPABASE_URL,
      validate: (input) => !!input || 'URL is required'
    },
    {
      type: 'password',
      name: 'anonKey',
      message: 'Enter Supabase anon key:',
      default: options.key || process.env.SUPABASE_ANON_KEY,
      validate: (input) => !!input || 'Anon key is required'
    },
    {
      type: 'confirm',
      name: 'enableLogging',
      message: 'Enable Supabase logging?',
      default: false
    }
  ]);

  try {
    // 创建 Supabase 客户端
    const supabase = createClient(answers.url, answers.anonKey);

    // 测试连接
    const { data, error } = await supabase.from('context_metadata').select('id').limit(1);

    if (error) {
      console.error(chalk.red('❌ Connection failed:'), error);
      return;
    }

    // 更新 .env 文件
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) 
      ? fs.readFileSync(envPath, 'utf-8') 
      : '';

    // 更新或添加 Supabase 配置
    const supabaseConfig = [
      `SUPABASE_URL=${answers.url}`,
      `SUPABASE_ANON_KEY=${answers.anonKey}`,
      `SUPABASE_LOGGING=${answers.enableLogging}`
    ];

    supabaseConfig.forEach(config => {
      const [key] = config.split('=');
      const regex = new RegExp(`^${key}=.*$`, 'm');
      
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, config);
      } else {
        envContent += `\n${config}`;
      }
    });

    fs.writeFileSync(envPath, envContent.trim() + '\n');

    console.log(chalk.green('✅ Supabase project initialized successfully!'));
    console.log(chalk.blue('🔗 Project URL:'), answers.url);
    console.log(chalk.blue('🔑 Logging:'), answers.enableLogging ? 'Enabled' : 'Disabled');

  } catch (err) {
    console.error(chalk.red('❌ Initialization failed:'), err);
  }
}

initSupabaseProject();

export {};
