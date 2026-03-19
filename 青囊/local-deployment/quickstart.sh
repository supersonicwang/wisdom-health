#!/bin/bash

# 本地部署快速启动脚本

echo "🚀 青囊本地部署快速启动"
echo ""

# 检查操作系统
OS=$(uname -s)
echo "📊 检测到操作系统: $OS"
echo ""

# 1. 检查 Ollama 是否安装
echo "📦 检查 Ollama..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama 已安装"
    OLLAMA_VERSION=$(ollama --version)
    echo "   版本: $OLLAMA_VERSION"
else
    echo "❌ Ollama 未安装"
    echo ""
    echo "请安装 Ollama:"
    if [[ "$OS" == "Darwin" ]]; then
        echo "  brew install ollama"
    else
        echo "  访问 https://ollama.com/download"
    fi
    echo ""
    read -p "是否继续使用其他部署方案? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# 2. 检查 Python
echo "🐍 检查 Python..."
if command -v python3 &> /dev/null; then
    echo "✅ Python 已安装"
    PYTHON_VERSION=$(python3 --version)
    echo "   版本: $PYTHON_VERSION"
else
    echo "❌ Python 未安装，请先安装 Python 3.8+"
    exit 1
fi

echo ""

# 3. 安装 Python 依赖
echo "📚 安装 Python 依赖..."
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
    echo "✅ 依赖安装完成"
else
    echo "⚠️  未找到 requirements.txt"
fi

echo ""

# 4. 配置环境变量
echo "⚙️  配置环境..."
if [ ! -f "configs/.env" ]; then
    cp configs/.env.example configs/.env
    echo "✅ 已创建 .env 配置文件"
    echo "   请根据需要编辑 configs/.env"
else
    echo "✅ 配置文件已存在"
fi

echo ""

# 5. 启动选项
echo "🎯 请选择启动方式:"
echo "1) Ollama (推荐，需要已安装)"
echo "2) 自定义服务器 (FastAPI)"
echo "3) Transformers 直接推理"
echo ""
read -p "请输入选项 (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "🚀 启动 Ollama 服务..."

        # 检查 Ollama 服务是否运行
        if pgrep -x "ollama" > /dev/null; then
            echo "✅ Ollama 服务已在运行"
        else
            echo "⚡ 启动 Ollama 服务..."
            ollama serve &
            sleep 2
        fi

        # 检查模型是否已下载
        echo "📥 检查模型..."
        if ollama list | grep -q "qwen2:7b"; then
            echo "✅ 模型已存在"
        else
            echo "📥 下载模型 qwen2:7b (这可能需要几分钟)..."
            ollama pull qwen2:7b
        fi

        echo ""
        echo "✅ Ollama 已就绪！"
        echo "🌐 API 地址: http://localhost:11434"
        echo ""
        echo "测试命令:"
        echo '  curl http://localhost:11434/api/generate -d '"'"'{"model":"qwen2:7b","prompt":"你好"}'"'"''
        ;;

    2)
        echo "🚀 启动自定义服务器..."
        echo "⚠️  请确保已在 configs/.env 中配置正确的模型类型和地址"
        echo ""
        python3 server/local_server.py
        ;;

    3)
        echo "🚀 启动 Transformers 推理服务..."
        echo "⚠️  请确保已在 configs/.env 中配置 MODEL_PATH"
        echo ""
        python3 server/transformers_inference.py
        ;;

    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
