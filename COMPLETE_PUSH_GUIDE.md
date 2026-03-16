# 🚀 GitHub 推送完整指南

## 当前状态
✅ GitHub 仓库已创建
✅ 本地代码已准备好（8 个提交）
⏸️ 等待认证推送

---

## 方式 A：使用 Personal Access Token（推荐，5 分钟）

### 步骤 1：创建 Personal Access Token

1. **访问 Token 设置页面**：
   ```
   https://github.com/settings/tokens/new
   ```
   或从菜单：Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **填写 Token 信息**：
   ```
   Note: UniversalAI Agent Desktop Push

   Expiration: 90 days（或选择 No expiration）

   Select scopes:
   ✅ repo（全选，包括所有子选项）
   ```

3. **点击 "Generate token"**

4. **⚠️ 重要：立即复制 Token**
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   **注意**：Token 只显示一次，请立即复制保存！

### 步骤 2：推送代码

**选项 A：使用 Token 直接推送**

```bash
cd /Users/yeyuanyu/gs/c/agent

# 使用 Token 推送（替换 <YOUR_TOKEN> 为你的实际 Token）
git remote set-url origin https://<YOUR_TOKEN>@github.com/Mr-YeYuanYu/universalai-agent-desktop.git
git push -u origin main
```

**选项 B：推送时输入 Token**

```bash
cd /Users/yeyuanyu/gs/c/agent

# 移除旧的 remote
git remote remove origin

# 重新添加（会提示输入用户名和密码）
git remote add origin https://github.com/Mr-YeYuanYu/universalai-agent-desktop.git

# 推送时：
# Username: Mr-YeYuanYu
# Password: <粘贴你的 Token>
git push -u origin main
```

---

## 方式 B：使用 SSH 密钥（一劳永逸，10 分钟）

### 步骤 1：生成 SSH 密钥

```bash
# 生成新的 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按 Enter 使用默认路径
# 可以设置密码短语（也可以留空）

# 启动 SSH 代理
eval "$(ssh-agent -s)"

# 添加密钥到代理
ssh-add ~/.ssh/id_ed25519
```

### 步骤 2：添加到 GitHub

1. **复制公钥**：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. **添加到 GitHub**：
   - 访问：https://github.com/settings/ssh/new
   - Title: `MacBook Air`
   - 粘贴公钥内容
   - 点击 "Add SSH key"

### 步骤 3：使用 SSH 推送

```bash
cd /Users/yeyuanyu/gs/c/agent

# 修改 remote URL 为 SSH
git remote set-url origin git@github.com:Mr-YeYuanYu/universalai-agent-desktop.git

# 推送
git push -u origin main
```

---

## 方式 C：安装 GitHub CLI（最方便，5 分钟）

### 步骤 1：安装 GitHub CLI

```bash
# 使用 Homebrew 安装
brew install gh

# 或下载安装包
# https://github.com/cli/cli/releases/latest
```

### 步骤 2：登录 GitHub

```bash
gh auth login

# 选择：
# ? What account do you want to log into? GitHub.com
# ? What is your preferred protocol for Git operations? HTTPS
# ? Authenticate Git with your GitHub credentials? Yes
# ? How would you like to authenticate GitHub CLI? Login with a web browser
```

### 步骤 3：推送代码

```bash
cd /Users/yeyuanyu/gs/c/agent
git push -u origin main
```

---

## 🆘 故障排除

### Q1: 推送时提示 "fatal: 'origin' already exists"

**解决方案**：
```bash
git remote remove origin
git remote add origin https://github.com/Mr-YeYuanYu/universalai-agent-desktop.git
git push -u origin main
```

### Q2: 推送时提示 "fatal: could not read Username"

**解决方案**：使用 Token 方式：
```bash
git remote set-url origin https://<TOKEN>@github.com/Mr-YeYuanYu/universalai-agent-desktop.git
git push -u origin main
```

### Q3: 推送时提示 "fatal: Authentication failed"

**解决方案**：
1. 确认 Token 有 `repo` 权限
2. 确认 Token 没有过期
3. 尝试重新生成 Token

### Q4: 推送成功但没有看到 Actions

**解决方案**：
1. 访问：https://github.com/Mr-YeYuanYu/universalai-agent-desktop/actions
2. 点击 "I understand my workflows, go ahead and enable them"
3. 等待几秒后刷新页面

---

## ✅ 推送成功后

### 立即检查

1. **访问仓库**：
   ```
   https://github.com/Mr-YeYuanYu/universalai-agent-desktop
   ```

2. **查看文件**：
   - 应该看到 58 个文件
   - README.md 应该正确显示
   - 提交记录应该有 8 个

3. **查看 Actions**：
   ```
   https://github.com/Mr-YeYuanYu/universalai-agent-desktop/actions
   ```
   - 应该看到正在运行的工作流
   - 等待 10-15 分钟构建完成

4. **下载构建产物**（构建完成后）：
   - macOS: `.dmg`
   - Windows: `.msi`, `.exe`
   - Linux: `.deb`, `.AppImage`

---

## 📝 推荐执行顺序

**最快的方式（5 分钟）**：
1. ✅ 创建 Personal Access Token（2 分钟）
2. ✅ 使用 Token 推送（1 分钟）
3. ✅ 等待 Actions 构建（10-15 分钟）

**最安全的方式（10 分钟）**：
1. ✅ 生成 SSH 密钥（3 分钟）
2. ✅ 添加到 GitHub（2 分钟）
3. ✅ 使用 SSH 推送（1 分钟）

**最方便的方式（5 分钟 + 首次配置）**：
1. ✅ 安装 GitHub CLI（2 分钟）
2. ✅ 登录 GitHub（2 分钟）
3. ✅ 推送代码（1 分钟）

---

## 🎯 现在选择一种方式开始推送吧！

**我的推荐**：
- 如果你想快速完成：**使用 Personal Access Token**
- 如果你经常推送代码：**配置 SSH 密钥**
- 如果你喜欢命令行工具：**安装 GitHub CLI**

---

**需要帮助？**
告诉我你选择哪种方式，我会提供详细的逐步指导！
