#!/bin/bash

# UniversalAI Agent Desktop - GitHub 推送脚本
# 使用方法：./push-to-github.sh

set -e

echo "🚀 UniversalAI Agent Desktop - GitHub 推送向导"
echo "================================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 显示当前 Git 状态
echo "📋 当前 Git 状态："
git log --oneline -5
echo ""

# 提示用户创建 GitHub 仓库
echo "📝 步骤 1: 创建 GitHub 仓库"
echo "--------------------------------------"
echo "1. 访问：https://github.com/new"
echo "2. 仓库名：universalai-agent-desktop"
echo "3. 描述：🤖 AI-powered API Agent Desktop Application with Vector Search"
echo "4. 选择 Public 或 Private"
echo "5. ❌ 不要勾选任何初始化选项"
echo "6. 点击 'Create repository'"
echo ""

read -p "✅ 仓库创建完成？按 Enter 继续..."

# 获取 GitHub 用户名
read -p "请输入你的 GitHub 用户名 (默认: Mr-YeYuanYu): " username
username=${username:-Mr-YeYuanYu}

# 设置远程仓库
echo ""
echo "🔗 步骤 2: 设置远程仓库"
echo "--------------------------------------"
REPO_URL="https://github.com/${username}/universalai-agent-desktop.git"
echo "远程地址：$REPO_URL"

# 检查是否已经有 remote
if git remote | grep -q "origin"; then
    echo "⚠️  origin 已存在，更新 URL..."
    git remote set-url origin "$REPO_URL"
else
    echo "✅ 添加 origin..."
    git remote add origin "$REPO_URL"
fi

# 推送代码
echo ""
echo "📤 步骤 3: 推送代码到 GitHub"
echo "--------------------------------------"
echo "正在推送..."

if git push -u origin main; then
    echo ""
    echo "🎉 推送成功！"
    echo "================================"
    echo ""
    echo "📍 仓库地址："
    echo "   https://github.com/${username}/universalai-agent-desktop"
    echo ""
    echo "📊 Actions 构建："
    echo "   https://github.com/${username}/universalai-agent-desktop/actions"
    echo ""
    echo "⏱️  预计 10-15 分钟后可以下载构建产物"
    echo ""
    echo "✅ 所有步骤完成！"
else
    echo ""
    echo "❌ 推送失败"
    echo "========================"
    echo ""
    echo "可能的原因："
    echo "1. 需要认证 - 请使用 Personal Access Token 或 SSH"
    echo "2. 仓库未创建 - 请确认已在 GitHub 创建仓库"
    echo "3. 权限不足 - 请确认你有推送权限"
    echo ""
    echo "📖 查看帮助文档：GITHUB_SETUP_GUIDE.md"
    exit 1
fi
