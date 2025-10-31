#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于初始化Supabase数据库并应用migrations
 * 
 * 使用方法:
 *   node scripts/init-database.js
 * 
 * 环境变量要求:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 颜色输出辅助函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

// 加载环境变量
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    log('✓ Loaded environment variables from .env.local', 'green');
  }
}

// 检查环境变量
function checkEnvironment() {
  logSection('Checking Environment Variables');
  
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
      log(`✗ Missing: ${key}`, 'red');
    } else {
      log(`✓ Found: ${key}`, 'green');
    }
  }

  if (missing.length > 0) {
    log('\nError: Missing required environment variables', 'red');
    log('Please set them in .env.local or as environment variables', 'yellow');
    process.exit(1);
  }

  log('\n✓ All required environment variables are set', 'green');
}

// 测试数据库连接
async function testConnection(client) {
  logSection('Testing Database Connection');
  
  try {
    // 简单的健康检查查询
    const { error } = await client.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    log('✓ Successfully connected to Supabase', 'green');
    return true;
  } catch (error) {
    log('✗ Failed to connect to database', 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// 检查表是否存在
async function checkTables(client) {
  logSection('Checking Database Tables');
  
  const requiredTables = ['profiles', 'qsos', 'qsl_tokens', 'confirmation_logs', 'mail_batches'];
  const existingTables = [];
  const missingTables = [];

  for (const table of requiredTables) {
    const { error } = await client.from(table).select('id', { head: true, count: 'exact' }).limit(1);
    
    if (error && error.code === 'PGRST116') {
      missingTables.push(table);
      log(`✗ Table missing: ${table}`, 'red');
    } else {
      existingTables.push(table);
      log(`✓ Table exists: ${table}`, 'green');
    }
  }

  return {
    existingTables,
    missingTables,
    allTablesExist: missingTables.length === 0,
  };
}

// 读取并显示migration文件
function readMigrations() {
  logSection('Reading Migration Files');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    log('✗ Migrations directory not found', 'red');
    return [];
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    log('✗ No migration files found', 'red');
    return [];
  }

  log(`Found ${files.length} migration file(s):`, 'green');
  files.forEach(file => {
    log(`  - ${file}`, 'blue');
  });

  return files.map(file => ({
    filename: file,
    path: path.join(migrationsDir, file),
    content: fs.readFileSync(path.join(migrationsDir, file), 'utf8'),
  }));
}

// 获取数据库统计
async function getStats(client) {
  logSection('Database Statistics');
  
  const tables = ['profiles', 'qsos', 'qsl_tokens', 'confirmation_logs', 'mail_batches'];
  
  for (const table of tables) {
    try {
      const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST116') {
          log(`${table}: Table does not exist`, 'yellow');
        } else {
          log(`${table}: Error - ${error.message}`, 'red');
        }
      } else {
        log(`${table}: ${count} record(s)`, 'green');
      }
    } catch (err) {
      log(`${table}: Error - ${err.message}`, 'red');
    }
  }
}

// 主函数
async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        Supabase Database Initialization Script            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  // 1. 加载环境变量
  loadEnv();

  // 2. 检查环境变量
  checkEnvironment();

  // 3. 创建Supabase客户端
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 4. 测试连接
  const connected = await testConnection(client);
  if (!connected) {
    log('\nFailed to connect to database. Please check your configuration.', 'red');
    process.exit(1);
  }

  // 5. 检查表
  const { allTablesExist, missingTables } = await checkTables(client);

  // 6. 读取migrations
  const migrations = readMigrations();

  // 7. 如果表不存在，显示手动应用migration的说明
  if (!allTablesExist) {
    logSection('Migration Required');
    log('Some tables are missing. You need to apply the migrations:', 'yellow');
    log('\nOption 1: Using Supabase Dashboard (Recommended)', 'cyan');
    log('  1. Go to your Supabase project dashboard', 'blue');
    log('  2. Navigate to: SQL Editor', 'blue');
    log('  3. Create a new query', 'blue');
    log('  4. Copy and paste the content from these files:', 'blue');
    
    migrations.forEach(m => {
      log(`     - supabase/migrations/${m.filename}`, 'yellow');
    });
    
    log('  5. Execute the query', 'blue');
    
    log('\nOption 2: Using Supabase CLI', 'cyan');
    log('  1. Install Supabase CLI: npm install -g supabase', 'blue');
    log('  2. Link your project: supabase link --project-ref your-project-ref', 'blue');
    log('  3. Push migrations: supabase db push', 'blue');
    
    log('\nOption 3: Direct SQL Execution (Advanced)', 'cyan');
    log('  You can execute the SQL files directly using psql or another SQL client', 'blue');
  } else {
    log('\n✓ All required tables exist!', 'green');
  }

  // 8. 显示统计信息
  await getStats(client);

  // 9. 总结
  logSection('Summary');
  
  if (allTablesExist) {
    log('✓ Database is properly initialized and ready to use!', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Initialize admin user: POST /api/auth/init-admin', 'blue');
    log('  2. Start the application: npm run dev', 'blue');
  } else {
    log('⚠ Database initialization incomplete', 'yellow');
    log(`Missing tables: ${missingTables.join(', ')}`, 'yellow');
    log('\nPlease apply the migrations as described above.', 'yellow');
  }

  console.log('\n');
}

// 执行主函数
main().catch(error => {
  log('\n✗ Fatal error:', 'red');
  console.error(error);
  process.exit(1);
});
