@echo off
REM 部署准备检查脚本 (Windows)
REM 运行此脚本以检查部署前的准备工作是否完成

echo ============================================
echo 🚀 HamQSL MailConfirm - Vercel 部署准备检查
echo ============================================
echo.

set CHECKS_PASSED=0
set CHECKS_FAILED=0

echo 📦 检查依赖...

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [✓] Node.js 已安装 (!NODE_VERSION!)
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] Node.js 未安装
    set /a CHECKS_FAILED+=1
)

REM 检查 npm
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [✓] npm 已安装 (!NPM_VERSION!)
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] npm 未安装
    set /a CHECKS_FAILED+=1
)

REM 检查 package.json
if exist "package.json" (
    echo [✓] package.json 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] package.json 不存在
    set /a CHECKS_FAILED+=1
)

REM 检查 node_modules
if exist "node_modules" (
    echo [✓] 依赖已安装 (node_modules 存在^)
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] 依赖未安装，运行: npm install
    set /a CHECKS_FAILED+=1
)

echo.
echo 🔧 检查配置文件...

if exist "next.config.ts" (
    echo [✓] next.config.ts 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] next.config.ts 不存在
    set /a CHECKS_FAILED+=1
)

if exist "vercel.json" (
    echo [✓] vercel.json 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] vercel.json 不存在
    set /a CHECKS_FAILED+=1
)

if exist ".vercelignore" (
    echo [✓] .vercelignore 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] .vercelignore 不存在
    set /a CHECKS_FAILED+=1
)

if exist ".gitignore" (
    echo [✓] .gitignore 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] .gitignore 不存在
    set /a CHECKS_FAILED+=1
)

echo.
echo 📚 检查文档...

if exist "DEPLOY.md" (
    echo [✓] DEPLOY.md 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] DEPLOY.md 不存在
    set /a CHECKS_FAILED+=1
)

if exist "docs\VERCEL_DEPLOYMENT.md" (
    echo [✓] docs\VERCEL_DEPLOYMENT.md 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] docs\VERCEL_DEPLOYMENT.md 不存在
    set /a CHECKS_FAILED+=1
)

echo.
echo 🗂️ 检查项目文件...

if exist "src\app" (
    echo [✓] src\app 目录存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] src\app 目录不存在
    set /a CHECKS_FAILED+=1
)

if exist "src\lib" (
    echo [✓] src\lib 目录存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] src\lib 目录不存在
    set /a CHECKS_FAILED+=1
)

if exist "supabase\migrations" (
    echo [✓] supabase\migrations 目录存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] supabase\migrations 目录不存在
    set /a CHECKS_FAILED+=1
)

echo.
echo 🔐 检查环境变量模板...

if exist ".env.example" (
    echo [✓] .env.example 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] .env.example 不存在
    set /a CHECKS_FAILED+=1
)

if exist ".env.vercel.example" (
    echo [✓] .env.vercel.example 存在
    set /a CHECKS_PASSED+=1
) else (
    echo [✗] .env.vercel.example 不存在
    set /a CHECKS_FAILED+=1
)

if exist ".env.local" (
    echo [✓] .env.local 存在（本地开发）
    echo     注意：部署到 Vercel 时需要在 Dashboard 配置环境变量
    set /a CHECKS_PASSED+=1
) else (
    echo [ℹ] .env.local 不存在（可选，仅用于本地开发）
)

echo.
echo 🔍 检查 Git 状态...

where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [✓] Git 已安装
    set /a CHECKS_PASSED+=1
    
    git rev-parse --git-dir >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo [✓] Git 仓库已初始化
        set /a CHECKS_PASSED+=1
        
        git remote get-url origin >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            for /f "tokens=*" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
            echo [✓] 远程仓库已配置 (!REMOTE_URL!)
            set /a CHECKS_PASSED+=1
        ) else (
            echo [✗] 远程仓库未配置
            echo     提示：运行 git remote add origin ^<url^>
            set /a CHECKS_FAILED+=1
        )
    ) else (
        echo [✗] Git 仓库未初始化
        set /a CHECKS_FAILED+=1
    )
) else (
    echo [✗] Git 未安装
    set /a CHECKS_FAILED+=1
)

echo.
echo ============================================
echo 📊 检查结果统计
echo ============================================
echo 通过: %CHECKS_PASSED%
echo 失败: %CHECKS_FAILED%
echo.

if %CHECKS_FAILED% EQU 0 (
    echo 🎉 所有检查通过！你已准备好部署到 Vercel。
    echo.
    echo 📖 下一步：
    echo    1. 访问 https://vercel.com
    echo    2. 导入你的 GitHub 仓库
    echo    3. 配置环境变量（参考 .env.vercel.example^)
    echo    4. 点击 Deploy
    echo.
    echo    或查看详细文档: DEPLOY.md
    exit /b 0
) else (
    echo ⚠️ 有 %CHECKS_FAILED% 项检查失败，请先解决这些问题。
    echo.
    echo 📖 参考文档：
    echo    - README.md - 项目说明
    echo    - DEPLOY.md - 快速部署指南
    echo    - docs\VERCEL_DEPLOYMENT.md - 详细部署文档
    exit /b 1
)
