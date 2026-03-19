# 部署指南

本项目支持两种部署方式：**云端部署**（使用 Gemini API）和**本地部署**（使用本地模型）。界面完全一致，只需通过环境变量切换即可。

## 🚀 快速开始

### 方式 1: 云端部署（默认）

**优点：** 无需本地资源，模型能力强大
**缺点：** 需要网络连接，需要 API Key

1. 复制环境变量配置文件：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local`，设置你的 Gemini API Key：
   ```env
   USE_LOCAL_MODEL=false
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. 获取 API Key：
   - 访问 https://aistudio.google.com/apikey
   - 创建并复制 API Key

4. 启动应用：
   ```bash
   npm install
   npm run dev
   ```

### 方式 2: 本地部署（推荐）

**优点：** 完全私密，无需网络，无 API 费用
**缺点：** 需要本地计算资源

#### 步骤 1: 安装本地模型服务

**Mac 用户（推荐 Ollama）：**
```bash
# 安装 Ollama
brew install ollama

# 启动服务
ollama serve

# 在新终端下载模型
ollama pull qwen2:7b
```

**Windows 用户：**
- 下载 [Ollama](https://ollama.com/download) 或 [LM Studio](https://lmstudio.ai)
- 安装并启动
- 下载 `qwen2:7b` 模型

#### 步骤 2: 配置环境变量

编辑 `.env.local`：
```env
# 使用本地模型
USE_LOCAL_MODEL=true

# Ollama 配置
LOCAL_MODEL_TYPE=ollama
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=qwen2:7b
```

**其他本地服务配置：**

**vLLM（高性能，需要 GPU）：**
```env
USE_LOCAL_MODEL=true
LOCAL_MODEL_TYPE=vllm
LOCAL_MODEL_URL=http://localhost:8000
LOCAL_MODEL_NAME=Qwen/Qwen2-7B-Instruct
```

**LM Studio：**
```env
USE_LOCAL_MODEL=true
LOCAL_MODEL_TYPE=lmstudio
LOCAL_MODEL_URL=http://localhost:1234
LOCAL_MODEL_NAME=qwen2-7b
```

#### 步骤 3: 启动应用

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 🔄 在本地和云端之间切换

只需修改 `.env.local` 中的 `USE_LOCAL_MODEL` 值：

```env
# 使用云端
USE_LOCAL_MODEL=false
GEMINI_API_KEY=your-api-key

# 或使用本地
USE_LOCAL_MODEL=true
LOCAL_MODEL_TYPE=ollama
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=qwen2:7b
```

修改后重启开发服务器（`npm run dev`）即可。

## 📊 配置对比

| 配置项 | 云端部署 | 本地部署 |
|--------|---------|---------|
| USE_LOCAL_MODEL | `false` | `true` |
| GEMINI_API_KEY | 必需 | 不需要 |
| LOCAL_MODEL_TYPE | - | `ollama` / `vllm` / `lmstudio` |
| LOCAL_MODEL_URL | - | 本地服务地址 |
| LOCAL_MODEL_NAME | - | 模型名称 |

## 🤖 推荐的本地模型

| 模型 | 大小 | 最低配置 | 适用场景 |
|------|------|----------|----------|
| qwen2:7b | ~4GB | 8GB RAM | 中文对话（推荐） |
| llama3.2:8b | ~4.5GB | 8GB RAM | 英文对话 |
| mistral:7b | ~4GB | 8GB RAM | 代码生成 |
| qwen2:14b | ~8GB | 16GB RAM | 高质量中文 |

## 🔧 故障排除

### 问题：本地模型连接失败

**检查清单：**
1. 确认本地服务已启动：
   ```bash
   # Ollama
   ollama list  # 查看已下载的模型
   curl http://localhost:11434/api/tags  # 测试连接

   # vLLM
   curl http://localhost:8000/v1/models

   # LM Studio
   # 查看 LM Studio 界面的 Local Server 标签
   ```

2. 确认模型已下载：
   ```bash
   ollama pull qwen2:7b
   ```

3. 检查端口是否正确：
   - Ollama: 11434
   - vLLM: 8000（可自定义）
   - LM Studio: 1234（可自定义）

4. 查看浏览器控制台错误信息

### 问题：云端 API 调用失败

1. 检查 API Key 是否正确
2. 确认网络连接正常
3. 检查 API 配额是否用完

### 问题：界面显示但无法对话

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签的错误信息
3. 检查 `.env.local` 配置是否正确
4. 确认已重启开发服务器

## 📚 更多文档

- [本地部署详细指南](./local-deployment/README.md)
- [模型微调指南](./model-training/README.md)
- [主 README](./README.md)

## 💡 提示

- 本地部署时，首次对话可能较慢（模型加载）
- 推荐使用 Ollama，配置最简单
- Mac 用户优先选择 Ollama（完美支持 Metal）
- 有 NVIDIA GPU 的 Windows 用户可选择 vLLM（性能更好）
- 两种部署方式可以随时切换，界面体验完全一致
