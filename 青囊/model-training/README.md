# 模型微调 (Model Training)

本文件夹包含用于微调 AI 模型的所有资源和脚本。

## 文件夹结构

```
model-training/
├── datasets/          # 训练数据集
├── scripts/          # 训练脚本
├── models/           # 训练后的模型权重
├── configs/          # 训练配置文件
└── README.md         # 本文档
```

## 支持的微调框架

### 1. LLaMA Factory
适用于 LLaMA、Qwen、ChatGLM 等主流模型的微调。

**安装：**
```bash
pip install llama-factory
```

**快速开始：**
```bash
# 在 configs/ 中创建配置文件
llamafactory-cli train configs/sft_config.yaml
```

### 2. Hugging Face Transformers
通用的模型微调框架。

**安装：**
```bash
pip install transformers datasets peft accelerate bitsandbytes
```

**示例脚本：**
```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoRA, get_peft_model

# 参考 scripts/train_with_transformers.py
```

### 3. OpenAI Fine-tuning
适用于 GPT 系列模型的微调。

**文档：** https://platform.openai.com/docs/guides/fine-tuning

## 数据准备

### 数据格式
将训练数据放在 `datasets/` 文件夹中，支持以下格式：

**对话格式 (JSONL):**
```json
{"messages": [{"role": "user", "content": "问题"}, {"role": "assistant", "content": "回答"}]}
```

**指令格式 (JSON):**
```json
{"instruction": "任务描述", "input": "输入", "output": "期望输出"}
```

## 推荐的模型

### 本地运行（Mac/Windows）

**轻量级模型（8GB VRAM）：**
- Qwen2-7B
- Llama-3.2-8B
- ChatGLM3-6B
- Mistral-7B

**中等模型（16GB+ VRAM）：**
- Qwen2-14B
- Llama-3.1-13B
- Yi-34B (量化版本)

### 微调方法

**LoRA (低秩适配):**
- 参数效率高，只需微调少量参数
- 适合消费级硬件
- 推荐用于大部分场景

**全量微调:**
- 需要更多计算资源
- 适合有充足资源且需要深度定制的场景

## 快速开始

1. **准备数据集：**
   ```bash
   # 将数据放入 datasets/ 文件夹
   cp your_data.jsonl datasets/
   ```

2. **创建配置文件：**
   ```bash
   # 参考 configs/example_config.yaml
   ```

3. **开始训练：**
   ```bash
   python scripts/train.py --config configs/your_config.yaml
   ```

4. **导出模型：**
   ```bash
   # 训练完成的模型保存在 models/ 文件夹
   # 可以直接在本地部署中使用
   ```

## 资源和文档

- [LLaMA Factory 文档](https://github.com/hiyouga/LLaMA-Factory)
- [Hugging Face PEFT](https://huggingface.co/docs/peft)
- [Transformers 训练指南](https://huggingface.co/docs/transformers/training)

## 注意事项

- 确保有足够的磁盘空间存储模型和数据集
- Mac 用户可使用 Metal (MPS) 加速
- Windows 用户建议使用 CUDA (NVIDIA GPU)
- 没有 GPU 也可以使用 CPU 训练，但速度较慢
