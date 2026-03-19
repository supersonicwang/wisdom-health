"""
本地模型服务器
提供统一的 API 接口，支持多种本地模型部署方案
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Local Model Server")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置
MODEL_TYPE = os.getenv("LOCAL_MODEL_TYPE", "ollama")  # ollama, vllm, lmstudio
MODEL_URL = os.getenv("LOCAL_MODEL_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("LOCAL_MODEL_NAME", "qwen2:7b")

class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2048
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    content: str
    model: str
    finish_reason: str

async def call_ollama(messages: List[Message], temperature: float, max_tokens: int):
    """调用 Ollama API"""
    # 构建 prompt
    prompt = ""
    for msg in messages:
        role = msg.role
        content = msg.content
        if role == "system":
            prompt += f"System: {content}\n"
        elif role == "user":
            prompt += f"User: {content}\n"
        elif role == "assistant":
            prompt += f"Assistant: {content}\n"
    prompt += "Assistant: "

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{MODEL_URL}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False
            }
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")

async def call_vllm(messages: List[Message], temperature: float, max_tokens: int):
    """调用 vLLM API (OpenAI 兼容)"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{MODEL_URL}/v1/chat/completions",
            json={
                "model": MODEL_NAME,
                "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_lmstudio(messages: List[Message], temperature: float, max_tokens: int):
    """调用 LM Studio API (OpenAI 兼容)"""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{MODEL_URL}/v1/chat/completions",
            json={
                "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
                "temperature": temperature,
                "max_tokens": max_tokens
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

async def call_transformers_local(messages: List[Message], temperature: float, max_tokens: int):
    """直接调用本地 Transformers 模型"""
    # 这需要模型已加载在内存中
    # 参考 transformers_inference.py
    raise NotImplementedError("请先启动 transformers_inference.py 服务")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """统一聊天接口"""
    try:
        if MODEL_TYPE == "ollama":
            content = await call_ollama(
                request.messages,
                request.temperature,
                request.max_tokens
            )
        elif MODEL_TYPE == "vllm":
            content = await call_vllm(
                request.messages,
                request.temperature,
                request.max_tokens
            )
        elif MODEL_TYPE == "lmstudio":
            content = await call_lmstudio(
                request.messages,
                request.temperature,
                request.max_tokens
            )
        elif MODEL_TYPE == "transformers":
            content = await call_transformers_local(
                request.messages,
                request.temperature,
                request.max_tokens
            )
        else:
            raise HTTPException(status_code=400, detail=f"不支持的模型类型: {MODEL_TYPE}")

        return ChatResponse(
            content=content,
            model=MODEL_NAME,
            finish_reason="stop"
        )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"模型服务不可用: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"内部错误: {str(e)}")

@app.get("/health")
async def health():
    """健康检查"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            if MODEL_TYPE == "ollama":
                await client.get(f"{MODEL_URL}/api/tags")
            else:
                await client.get(f"{MODEL_URL}/v1/models")
        return {"status": "healthy", "model_type": MODEL_TYPE, "model_name": MODEL_NAME}
    except:
        return {"status": "unhealthy", "model_type": MODEL_TYPE}

@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "Local Model Server",
        "model_type": MODEL_TYPE,
        "model_name": MODEL_NAME,
        "model_url": MODEL_URL
    }

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 启动本地模型服务器")
    print(f"📦 模型类型: {MODEL_TYPE}")
    print(f"🤖 模型名称: {MODEL_NAME}")
    print(f"🔗 模型地址: {MODEL_URL}")
    print(f"🌐 服务地址: http://localhost:3001")

    uvicorn.run(app, host="0.0.0.0", port=3001)
