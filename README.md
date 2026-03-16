# UniversalAI Agent Desktop

🤖 **AI-powered API interaction through natural language conversation**

UniversalAI Agent is a desktop application that helps users interact with APIs using natural language. It leverages AI to understand user intent, searches for relevant APIs in a vector database (Milvus), and executes API calls with user confirmation.

## ✨ Features

- 🗣️ **Natural Language Interface**: Interact with APIs using plain language
- 🔍 **Semantic API Search**: Powered by Milvus vector database
- 🤖 **AI-Powered Understanding**: LLM integration for intent analysis
- 🔐 **Secure Configuration**: Encrypted storage of tokens and credentials
- 💬 **Real-time Streaming**: SSE-based streaming responses
- ✅ **User Confirmation**: Explicit confirmation before API execution

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 9.0+
- **Rust** (stable)
- **Platform-specific dependencies**:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft Visual Studio C++ Build Tools
  - **Linux**: GTK, WebKitGTK (see Tauri docs)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Mr-YeYuanYu/universalai-agent-desktop.git
cd universalai-agent-desktop
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Run development server**
```bash
pnpm dev
```

4. **Build for production**
```bash
pnpm build
```

## 🏗️ Architecture

```
UniversalAI Agent Desktop
├── Frontend (SolidJS + Kobalte + Tailwind)
│   ├── Config UI
│   ├── Chat Interface
│   └── API Confirmation Modal
│
├── Backend (Rust + Tauri)
│   └── Encrypted Config Storage
│
└── Services
    ├── LLM Client (SSE streaming)
    ├── Milvus Client (Vector search)
    └── API Execution Service
```

## 📖 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Definition Format](./docs/API_FORMAT.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🛠️ Tech Stack

- **Desktop Framework**: [Tauri v2](https://tauri.app/)
- **Frontend Framework**: [SolidJS](https://www.solidjs.com/)
- **UI Components**: [Kobalte](https://kobalte.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Vector Database**: [Milvus](https://milvus.io/)
- **LLM Integration**: SSE (Server-Sent Events)

## 📦 Project Structure

```
universalai-agent-desktop/
├── packages/
│   └── tauri-app/          # Main Tauri application
│       ├── src/            # SolidJS frontend
│       └── src-tauri/      # Rust backend
├── .github/
│   └── workflows/          # CI/CD pipelines
└── docs/                   # Documentation
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👤 Author

**Mr-YeYuanYu**
- GitHub: [@Mr-YeYuanYu](https://github.com/Mr-YeYuanYu)

## 🙏 Acknowledgments

- Inspired by [OpenCode](https://github.com/anomalyco/opencode)
- Built with [Tauri](https://tauri.app/)
- UI powered by [SolidJS](https://www.solidjs.com/)

---

**Made with ❤️ by Mr-YeYuanYu**
