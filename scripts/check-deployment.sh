#!/bin/bash

# 部署准备检查脚本
# 运行此脚本以检查部署前的准备工作是否完成

echo "🚀 HamQSL MailConfirm - Vercel 部署准备检查"
echo "============================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查计数
CHECKS_PASSED=0
CHECKS_FAILED=0

# 检查函数
check_item() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((CHECKS_FAILED++))
    fi
}

# 1. 检查 Node.js 版本
echo "📦 检查依赖..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_item "Node.js 已安装 ($NODE_VERSION)" 0
else
    check_item "Node.js 未安装" 1
fi

# 2. 检查 npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_item "npm 已安装 ($NPM_VERSION)" 0
else
    check_item "npm 未安装" 1
fi

# 3. 检查 package.json
if [ -f "package.json" ]; then
    check_item "package.json 存在" 0
else
    check_item "package.json 不存在" 1
fi

# 4. 检查 node_modules
if [ -d "node_modules" ]; then
    check_item "依赖已安装 (node_modules 存在)" 0
else
    check_item "依赖未安装，运行: npm install" 1
fi

echo ""
echo "🔧 检查配置文件..."

# 5. 检查 next.config.ts
if [ -f "next.config.ts" ]; then
    check_item "next.config.ts 存在" 0
else
    check_item "next.config.ts 不存在" 1
fi

# 6. 检查 vercel.json
if [ -f "vercel.json" ]; then
    check_item "vercel.json 存在" 0
else
    check_item "vercel.json 不存在" 1
fi

# 7. 检查 .vercelignore
if [ -f ".vercelignore" ]; then
    check_item ".vercelignore 存在" 0
else
    check_item ".vercelignore 不存在" 1
fi

# 8. 检查 .gitignore
if [ -f ".gitignore" ]; then
    check_item ".gitignore 存在" 0
else
    check_item ".gitignore 不存在" 1
fi

echo ""
echo "📚 检查文档..."

# 9. 检查部署文档
if [ -f "DEPLOY.md" ]; then
    check_item "DEPLOY.md 存在" 0
else
    check_item "DEPLOY.md 不存在" 1
fi

if [ -f "docs/VERCEL_DEPLOYMENT.md" ]; then
    check_item "docs/VERCEL_DEPLOYMENT.md 存在" 0
else
    check_item "docs/VERCEL_DEPLOYMENT.md 不存在" 1
fi

echo ""
echo "🗂️ 检查项目文件..."

# 10. 检查关键目录
if [ -d "src/app" ]; then
    check_item "src/app 目录存在" 0
else
    check_item "src/app 目录不存在" 1
fi

if [ -d "src/lib" ]; then
    check_item "src/lib 目录存在" 0
else
    check_item "src/lib 目录不存在" 1
fi

if [ -d "supabase/migrations" ]; then
    check_item "supabase/migrations 目录存在" 0
else
    check_item "supabase/migrations 目录不存在" 1
fi

echo ""
echo "🔐 检查环境变量模板..."

# 11. 检查环境变量示例文件
if [ -f ".env.example" ]; then
    check_item ".env.example 存在" 0
else
    check_item ".env.example 不存在" 1
fi

if [ -f ".env.vercel.example" ]; then
    check_item ".env.vercel.example 存在" 0
else
    check_item ".env.vercel.example 不存在" 1
fi

# 12. 检查是否有 .env.local (本地开发)
if [ -f ".env.local" ]; then
    check_item ".env.local 存在（本地开发）" 0
    echo -e "   ${YELLOW}注意：部署到 Vercel 时需要在 Dashboard 配置环境变量${NC}"
else
    echo -e "${YELLOW}ℹ${NC} .env.local 不存在（可选，仅用于本地开发）"
fi

echo ""
echo "🔍 检查 Git 状态..."

# 13. 检查 Git
if command -v git &> /dev/null; then
    check_item "Git 已安装" 0
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        check_item "Git 仓库已初始化" 0
        
        # 检查是否有远程仓库
        if git remote -v | grep -q "origin"; then
            REMOTE_URL=$(git remote get-url origin)
            check_item "远程仓库已配置 ($REMOTE_URL)" 0
        else
            check_item "远程仓库未配置" 1
            echo -e "   ${YELLOW}提示：运行 git remote add origin <url>${NC}"
        fi
        
        # 检查是否有未提交的更改
        if [ -z "$(git status --porcelain)" ]; then
            check_item "没有未提交的更改" 0
        else
            echo -e "${YELLOW}⚠${NC} 有未提交的更改"
            echo -e "   ${YELLOW}提示：运行 git add . && git commit -m 'message' && git push${NC}"
        fi
    else
        check_item "Git 仓库未初始化" 1
    fi
else
    check_item "Git 未安装" 1
fi

echo ""
echo "============================================"
echo "📊 检查结果统计"
echo "============================================"
echo -e "${GREEN}通过: $CHECKS_PASSED${NC}"
echo -e "${RED}失败: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有检查通过！你已准备好部署到 Vercel。${NC}"
    echo ""
    echo "📖 下一步："
    echo "   1. 访问 https://vercel.com"
    echo "   2. 导入你的 GitHub 仓库"
    echo "   3. 配置环境变量（参考 .env.vercel.example）"
    echo "   4. 点击 Deploy"
    echo ""
    echo "   或查看详细文档: DEPLOY.md"
    exit 0
else
    echo -e "${RED}⚠️ 有 $CHECKS_FAILED 项检查失败，请先解决这些问题。${NC}"
    echo ""
    echo "📖 参考文档："
    echo "   - README.md - 项目说明"
    echo "   - DEPLOY.md - 快速部署指南"
    echo "   - docs/VERCEL_DEPLOYMENT.md - 详细部署文档"
    exit 1
fi
