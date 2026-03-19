"""
使用 Transformers 直接推理
适合需要完全控制推理过程的场景
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import os

app = FastAPI(title="Transformers Inference Server")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置
MODEL_PATH = os.getenv("MODEL_PATH", "../models/qwen2-7b-finetuned")
DEVICE = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

print(f"🚀 加载模型: {MODEL_PATH}")
print(f"🔧 设备: {DEVICE}")

# 加载模型和分词器
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True,
    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
    device_map="auto" if DEVICE == "cuda" else None
)

if DEVICE == "mps":
    model = model.to("mps")
elif DEVICE == "cpu":
    model = model.to("cpu")

model.eval()

print("✅ 模型加载完成")

class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2048
    top_p: Optional[float] = 0.9
    top_k: Optional[int] = 50

class ChatResponse(BaseModel):
    content: str
    model: str

def format_messages(messages: List[Message]) -> str:
    """格式化消息为模型输入"""
    formatted = ""
    for msg in messages:
        if msg.role == "system":
            formatted += f"<|system|>\n{msg.content}\n"
        elif msg.role == "user":
            formatted += f"<|user|>\n{msg.content}\n"
        elif msg.role == "assistant":
            formatted += f"<|assistant|>\n{msg.content}\n"
    formatted += "<|assistant|>\n"
    return formatted

@app.post("/v1/chat/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest):
    """OpenAI 兼容的聊天接口"""
    try:
        # 格式化输入
        prompt = format_messages(request.messages)

        # 分词
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

        # 生成
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p,
                top_k=request.top_k,
                do_sample=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id
            )

        # 解码
        response_text = tokenizer.decode(
            outputs[0][inputs.input_ids.shape[1]:],
            skip_special_tokens=True
        )

        return ChatResponse(
            content=response_text.strip(),
            model=MODEL_PATH
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推理错误: {str(e)}")

@app.get("/health")
async def health():
    """健康检查"""
    return {
        "status": "healthy",
        "model": MODEL_PATH,
        "device": DEVICE
    }

@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "Transformers Inference Server",
        "model": MODEL_PATH,
        "device": DEVICE
    }

if __name__ == "__main__":
    import uvicorn
    print(f"🌐 启动服务: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
