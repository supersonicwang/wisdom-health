# 本地部署 (Local Deployment)

本文件夹包含在本地 Mac/Windows 上部署和运行 AI 模型的所有配置和服务。

## 文件夹结构

```
local-deployment/
├── server/           # 本地服务器代码
├── configs/          # 配置文件
├── models/           # 模型存储（或符号链接）
└── README.md         # 本文档
```

## 部署方案

### 方案 1: Ollama（推荐，最简单）

**适用于：** Mac 和 Windows 用户，零配置启动

**安装：**
```bash
# Mac
brew install ollama

# Windows
# 从 https://ollama.com/download 下载安装器
```

**使用：**
```bash
# 下载并运行模型
ollama run qwen2:7b

# 启动服务（默认端口 11434）
ollama serve

# 在应用中使用
# API: http://localhost:11434/api/generate
```

**支持的模型：**
- qwen2:7b / qwen2:14b
- llama3.2:8b / llama3.1:13b
- mistral:7b
- gemma2:9b

### 方案 2: LM Studio

**适用于：** 需要图形界面的用户

**安装：**
从 https://lmstudio.ai 下载

**特点：**
- 图形界面操作
- 自动模型下载
- 内置 API 服务器
- 支持量化模型

**使用：**
1. 打开 LM Studio
2. 在 "Discover" 中搜索并下载模型
3. 在 "Local Server" 中启动服务
4. 默认 API: http://localhost:1234/v1

### 方案 3: vLLM（高性能）

**适用于：** 有 NVIDIA GPU 的用户，追求高性能

**安装：**
```bash
pip install vllm
```

**使用：**
```bash
python -m vllm.entrypoints.openai.api_server \
    --model Qwen/Qwen2-7B-Instruct \
    --host 0.0.0.0 \
    --port 8000
```

**API:** http://localhost:8000/v1

### 方案 4: Transformers + FastAPI（自定义）

**适用于：** 需要完全控制的开发者

参考 `server/local_server.py` 中的实现。

## 快速开始

### 1. 选择并启动模型服务

**使用 Ollama (推荐):**
```bash
# 安装并启动
ollama serve

# 下载模型
ollama pull qwen2:7b

# 测试
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2:7b",
  "prompt": "你好"
}'
```

### 2. 配置前端应用

修改主项目的 `.env.local`:

```env
# 切换到本地模型
USE_LOCAL_MODEL=true
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_TYPE=ollama
LOCAL_MODEL_NAME=qwen2:7b
```

### 3. 启动应用

```bash
# 在项目根目录
npm run dev
```

### 4. 使用微调的模型

如果你在 `model-training/` 中训练了自己的模型：

**Ollama 方式：**
```bash
# 创建 Modelfile
cd local-deployment/configs
cat > Modelfile <<EOF
FROM ../models/your-finetuned-model
PARAMETER temperature 0.7
EOF

# 创建模型
ollama create my-custom-model -f Modelfile

# 使用
ollama run my-custom-model
```

**vLLM 方式：**
```bash
python -m vllm.entrypoints.openai.api_server \
    --model ../model-training/models/your-finetuned-model \
    --port 8000
```

## API 接口适配

本地模型 API 通常兼容 OpenAI 格式，在 `server/` 中提供了适配器。

### 统一接口
```javascript
// 无论使用哪种本地服务，都使用统一的调用方式
const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: '你好' }]
  })
});
```

适配器会自动转换请求到对应的本地模型服务。

## 性能建议

### Mac (Apple Silicon)
- 推荐使用 Ollama，完美支持 Metal 加速
- 7B 模型：8GB 内存可运行
- 14B 模型：16GB 内存推荐

### Windows (NVIDIA GPU)
- 有 GPU：推荐 vLLM 或 LM Studio
- 无 GPU：使用 Ollama 或 LM Studio (CPU 模式)
- 8GB VRAM：可运行 7B 模型
- 16GB+ VRAM：可运行 13B-34B 模型

### Windows (无独显)
- 使用 Ollama CPU 模式
- 推荐量化模型（4-bit）
- 7B 模型可在 16GB 系统内存上运行

## 模型推荐

| 模型 | 大小 | 最低配置 | 推荐用途 |
|------|------|----------|----------|
| Qwen2-7B | ~4GB (4-bit) | 8GB RAM | 通用对话 |
| Llama-3.2-8B | ~4.5GB | 8GB RAM | 英文优先 |
| Mistral-7B | ~4GB | 8GB RAM | 代码生成 |
| Qwen2-14B | ~8GB (4-bit) | 16GB RAM | 高质量对话 |
| Llama-3.1-13B | ~7GB | 16GB RAM | 推理任务 |

## 故障排除

### 模型加载慢
- 确保模型在 SSD 上
- 使用量化版本（4-bit/8-bit）

### 内存不足
- 使用更小的模型
- 降低 batch size
- 启用量化

### API 连接失败
- 检查服务是否启动
- 确认端口未被占用
- 查看防火墙设置

## 资源链接

- [Ollama 官网](https://ollama.com)
- [LM Studio](https://lmstudio.ai)
- [vLLM 文档](https://docs.vllm.ai)
- [Hugging Face 模型库](https://huggingface.co/models)
