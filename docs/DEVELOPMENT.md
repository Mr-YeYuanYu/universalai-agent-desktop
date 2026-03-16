# UniversalAI Agent Desktop - 开发指南

## 🚀 快速开始

### 1. 环境要求

确保你的系统已安装以下工具：

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Rust** (stable)
- **Git**

#### macOS 额外要求
```bash
xcode-select --install
```

#### Windows 额外要求
- Microsoft Visual Studio C++ Build Tools
- Windows 10/11 SDK

### 2. 安装依赖

```bash
# 安装 pnpm（如果还没有）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 开发模式

```bash
# 启动开发服务器
pnpm dev
```

这会同时启动：
- Vite 开发服务器（http://localhost:5173）
- Tauri 应用窗口

### 4. 构建生产版本

```bash
# 构建应用
pnpm build
```

构建产物位于 `packages/tauri-app/src-tauri/target/release/bundle/`

---

## 📁 项目结构

```
universalai-agent-desktop/
├── packages/
│   ├── tauri-app/              # 主应用
│   │   ├── src/                # SolidJS 前端
│   │   │   ├── components/     # UI 组件
│   │   │   ├── modules/        # 功能模块
│   │   │   ├── stores/         # 状态管理
│   │   │   ├── services/       # 服务层
│   │   │   ├── App.tsx         # 根组件
│   │   │   └── main.tsx        # 入口文件
│   │   │
│   │   └── src-tauri/          # Rust 后端
│   │       ├── src/
│   │       │   ├── main.rs     # 入口
│   │       │   ├── lib.rs      # Tauri 命令
│   │       │   └── commands/   # 命令模块
│   │       ├── Cargo.toml      # Rust 依赖
│   │       └── tauri.conf.json # Tauri 配置
│   │
│   └── shared/                 # 共享代码
│       ├── types/              # 类型定义
│       │   ├── config.ts
│       │   ├── api.ts
│       │   └── chat.ts
│       └── utils/              # 工具函数
│
├── .github/
│   └── workflows/              # CI/CD
│       └── build.yml           # 自动构建
│
├── docs/                       # 文档
├── package.json                # 根配置
├── pnpm-workspace.yaml         # 工作空间配置
└── README.md
```

---

## 🛠️ 开发工作流

### 功能开发流程

1. **创建功能分支**
```bash
git checkout -b feature/your-feature-name
```

2. **开发功能**
   - 在 `packages/tauri-app/src/` 开发前端代码
   - 在 `packages/tauri-app/src-tauri/src/` 开发后端代码
   - 在 `packages/shared/` 添加共享类型和工具

3. **测试功能**
```bash
pnpm dev
```

4. **提交代码**
```bash
git add .
git commit -m "feat: 添加了某某功能"
git push origin feature/your-feature-name
```

5. **创建 Pull Request**
   - GitHub Actions 会自动运行构建测试
   - 等待代码审查

---

## 📝 代码规范

### TypeScript/SolidJS

- 使用 **函数式组件**
- 使用 **TypeScript** 严格模式
- 遵循 **ESLint** 和 **Prettier** 规范
- 组件命名：**PascalCase**（如 `ConfigPage.tsx`）
- 函数命名：**camelCase**（如 `loadConfig`）
- 常量命名：**UPPER_SNAKE_CASE**（如 `API_ENDPOINTS`）

### Rust

- 遵循 **Rust 标准命名规范**
- 使用 **clippy** 进行代码检查
- 函数命名：**snake_case**
- 结构体命名：**PascalCase**

### Git 提交规范

使用 **Conventional Commits**：

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整（不影响功能）
refactor: 重构代码
test: 测试相关
chore: 构建/工具相关
```

示例：
```
feat: 添加了配置管理模块
fix: 修复了 SSE 重连问题
docs: 更新了开发文档
```

---

## 🔧 关键技术点

### Tauri Commands（前后端通信）

**前端调用后端**：
```typescript
import { invoke } from '@tauri-apps/api/tauri';

const config = await invoke('load_encrypted_config');
```

**后端定义命令**：
```rust
#[tauri::command]
fn load_encrypted_config() -> Result<String, String> {
    // 实现逻辑
}
```

### SolidJS 状态管理

使用 **Signals** 和 **Stores**：
```typescript
import { createSignal, createStore } from 'solid-js/store';

// Signal（简单状态）
const [count, setCount] = createSignal(0);

// Store（复杂状态）
const [state, setState] = createStore({
  user: null,
  config: {}
});
```

### SSE 流式请求

```typescript
const response = await fetch('/api/stream', {
  method: 'POST',
  body: JSON.stringify({ messages })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  // 处理 SSE 数据
}
```

---

## 🧪 测试

### 单元测试（待添加）

```bash
pnpm test
```

### 集成测试

1. 启动应用：`pnpm dev`
2. 测试配置保存和加载
3. 测试 LLM 连接
4. 测试向量检索
5. 测试 API 执行

---

## 📦 构建和发布

### 本地构建

```bash
pnpm build
```

### CI/CD 自动构建

推送到 GitHub 后，GitHub Actions 会自动：

1. 在 **macOS**、**Windows**、**Linux** 上并行构建
2. 生成安装包：
   - macOS: `.dmg`
   - Windows: `.msi` / `.exe`
   - Linux: `.deb` / `.AppImage`
3. 创建 GitHub Release（仅 main 分支）

---

## 🐛 常见问题

### Q: Rust 编译错误
**A**: 确保安装了正确的 Rust 工具链：
```bash
rustup update stable
```

### Q: Tauri 窗口无法打开
**A**: 检查 `tauri.conf.json` 中的配置，确保端口未被占用

### Q: 依赖安装失败
**A**: 尝试清除缓存：
```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📚 学习资源

- [Tauri 文档](https://tauri.app/v2/guide/)
- [SolidJS 文档](https://www.solidjs.com/docs/latest)
- [Kobalte UI](https://kobalte.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 💬 获取帮助

- 查看 [Issues](https://github.com/Mr-YeYuanYu/universalai-agent-desktop/issues)
- 阅读项目文档

---

**Happy Coding! 🎉**
