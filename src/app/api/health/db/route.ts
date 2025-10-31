import { NextResponse } from 'next/server';
import { checkDatabaseConnection, checkDatabaseTables, getDatabaseStats, validateEnvironmentConfig, checkAuthConfiguration } from '@/lib/db-utils';

/**
 * 数据库健康检查API
 * GET /api/health/db
 * 
 * 检查数据库连接状态、表结构和配置
 */
export async function GET() {
  try {
    // 1. 验证环境变量配置
    const envConfig = validateEnvironmentConfig();

    // 2. 检查数据库连接
    const connectionInfo = await checkDatabaseConnection();

    // 3. 检查表结构
    const tableStatus = connectionInfo.connected 
      ? await checkDatabaseTables() 
      : { tablesExist: false, missingTables: [], migrationStatus: { applied: false, error: 'Not connected' } };

    // 4. 检查Auth配置
    const authConfig = connectionInfo.connected 
      ? await checkAuthConfiguration() 
      : { configured: false, error: 'Not connected' };

    // 5. 获取统计信息（如果表存在）
    const stats = tableStatus.tablesExist 
      ? await getDatabaseStats() 
      : { success: false, error: 'Tables not initialized' };

    // 确定整体健康状态
    const isHealthy = 
      envConfig.valid &&
      connectionInfo.connected &&
      tableStatus.tablesExist &&
      authConfig.configured;

    return NextResponse.json({
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      environment: {
        valid: envConfig.valid,
        missing: envConfig.missing,
        warnings: envConfig.warnings,
      },
      database: {
        connected: connectionInfo.connected,
        url: connectionInfo.url,
        error: connectionInfo.error,
      },
      tables: {
        initialized: tableStatus.tablesExist,
        missingTables: tableStatus.missingTables,
        migrationStatus: tableStatus.migrationStatus,
      },
      auth: authConfig,
      stats: stats.success ? stats.stats : undefined,
    }, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
    });
  }
}
