<div align="center">
<img width="1200" height="475" alt="GHBanner" src="./qingnang.png" />
</div>

# 青囊 (Qingnang) - AI 安全防护应用

一个智能的 AI 对话和安全防护应用，支持云端和本地部署。

View and Edit Our app in AI Studio: https://ai.studio/apps/drive/1EW1LnIc8rZZE4ADJ6nW8RVB4ByC15Lng

Already Deployed Our Tcm-wellness-guardian in https://tcm-wellness-guardian-782751271572.us-west1.run.app/

## 🚀 快速开始

**重要：** 云端部署和本地部署使用**相同的界面**，只需通过环境变量切换即可！

### 方式 1: 云端部署（使用 Gemini API）

**前置要求：** Node.js

1. 安装依赖并配置：
   ```bash
   npm install
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local`，设置你的 Gemini API Key：
   ```env
   USE_LOCAL_MODEL=false
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. 运行应用：
   ```bash
   npm run dev
   ```

### 方式 2: 本地部署（使用微调后的模型）

使用本地模型，无需云端 API，完全私密部署。

**前置要求：** Node.js + 本地模型服务

#### 快速启动（Ollama - 推荐）：

**Mac 用户：**
```bash
# 1. 安装 Ollama
brew install ollama

# 2. 启动服务并下载模型
ollama serve &
ollama pull qwen2:7b

# 3. 配置项目
cp .env.local.example .env.local
# 编辑 .env.local，设置 USE_LOCAL_MODEL=true

# 4. 启动应用
npm install
npm run dev
```

**Windows 用户：**
1. 下载安装 [Ollama](https://ollama.com/download)
2. 启动 Ollama 并下载模型 `qwen2:7b`
3. 配置 `.env.local`（设置 `USE_LOCAL_MODEL=true`）
4. 运行 `npm install && npm run dev`

**支持的本地部署方式：**
- 🎯 **Ollama**（推荐）- 零配置，支持 Mac 和 Windows
- 🚀 **vLLM** - 高性能，适合 NVIDIA GPU
- 🖥️ **LM Studio** - 图形界面，简单易用

## 📖 文档

- [部署指南（云端/本地切换）](./DEPLOYMENT_GUIDE.md) 
- [本地模型详细配置](./local-deployment/README.md)
- [模型微调指南](./model-training/README.md)

## 📚 项目结构

```
qingnang/
├── components/           # React 组件
├── services/            # 服务层
├── model-training/      # 🆕 模型微调
│   ├── datasets/       # 训练数据集
│   ├── scripts/        # 训练脚本
│   ├── models/         # 训练后的模型
│   └── configs/        # 训练配置
├── local-deployment/    # 🆕 本地部署
│   ├── server/         # 本地服务器
│   ├── configs/        # 配置文件
│   └── models/         # 模型存储
└── ...
```

## 🤖 模型微调

如果你想训练自己的专属 AI 模型：

**详细文档：** [model-training/README.md](./model-training/README.md)

**支持的框架：**
- LLaMA Factory
- Hugging Face Transformers
- PEFT (LoRA)

**推荐模型：**
- Qwen2-7B（中文优秀）
- Llama-3.2-8B（英文强大）
- Mistral-7B（代码生成）

**快速开始：**
```bash
cd model-training

# 1. 安装依赖
pip install -r requirements.txt

# 2. 准备数据
# 将数据放入 datasets/ 文件夹

# 3. 开始训练
python scripts/train_example.py
```

## 🔄 在云端和本地之间切换

**只需修改 `.env.local` 文件，界面保持完全一致！**

```env
# 使用云端服务
USE_LOCAL_MODEL=false
GEMINI_API_KEY=your-api-key

# 切换到本地模型（修改 USE_LOCAL_MODEL 即可）
USE_LOCAL_MODEL=true
LOCAL_MODEL_TYPE=ollama
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=qwen2:7b
```

修改后重启开发服务器即可生效。


## 🎯 特性

- ✅ **统一界面** - 云端和本地使用相同界面，一键切换
- ✅ **云端和本地双模式** - 灵活选择部署方式
- ✅ **隐私保护** - 内置 PII 检测和脱敏
- ✅ **对抗防御** - 防止 prompt injection 攻击
- ✅ **支持自定义模型微调** - 训练专属 AI
- ✅ **完全私密的本地部署** - 数据不出本地
- ✅ **多种模型服务支持** - Ollama、vLLM、LM Studio
- ✅ **跨平台** - Mac/Windows/Linux 全支持

## 📝 许可证

MIT License
