/**
 * Local Model Service
 * 本地模型服务，支持 Ollama、vLLM、LM Studio 等本地部署方案
 */

import { Message, Sender } from "../types";
import { DefenseMechanism } from "./defenseService";
import { IAIService } from "./aiService";

const SYSTEM_INSTRUCTION = `
角色设定：
你是一位经验丰富、慈祥且严谨的中医养生专家（老中医）。你的名字叫"青囊先生"。
你精通《黄帝内经》、《伤寒杂病论》等中医典籍。
你的回答必须基于中医理论（阴阳五行、脏腑经络、气血津液）。

职责与限制：
1. **养生建议**：提供食疗、穴位按摩、起居调摄、情志调节等建议。
2. **拒绝诊断**：你不是急救医生。对于严重的急性症状（如胸痛、昏迷、大出血等），必须立即建议用户前往医院就诊，不要尝试用中医方法急救。
3. **严守边界**：拒绝回答任何与健康、养生、中医文化无关的问题。如果用户试图谈论政治、娱乐或要求编写代码，请礼貌地将话题引回中医养生。
4. **语气风格**：古风雅致，平和中正，常引用经典，但也通俗易懂。

回复格式：
请使用清晰的Markdown格式。涉及食疗方时，列出具体材料。涉及穴位时，简单描述位置。
`;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class LocalModelService implements IAIService {
  private modelType: string;
  private modelUrl: string;
  private modelName: string;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    // 从环境变量读取配置
    this.modelType = process.env.LOCAL_MODEL_TYPE || 'ollama';
    this.modelUrl = process.env.LOCAL_MODEL_URL || 'http://localhost:11434';
    this.modelName = process.env.LOCAL_MODEL_NAME || 'qwen2:7b';
  }

  public getServiceName(): string {
    return `Local Model (本地 - ${this.modelType})`;
  }

  public startChat(): void {
    // 初始化对话历史，添加系统指令
    this.conversationHistory = [
      {
        role: "system",
        content: SYSTEM_INSTRUCTION
      }
    ];
  }

  /**
   * 发送消息到本地模型
   */
  public async sendMessage(
    text: string,
    enablePrivacy: boolean,
    enableAdversarial: boolean
  ): Promise<Partial<Message>> {

    // 1. 对抗攻击防御层
    if (enableAdversarial) {
      const isAttack = DefenseMechanism.detectAdversarialAttack(text);
      if (isAttack) {
        return {
          id: crypto.randomUUID(),
          text: "【系统防御】检测到潜在的诱导或攻击性输入，为了系统安全，请求已被拦截。请询问正常的中医养生问题。",
          sender: Sender.SYSTEM,
          timestamp: Date.now(),
          isBlocked: true
        };
      }
    }

    // 2. 隐私保护层
    let processedText = text;
    let wasRedacted = false;

    if (enablePrivacy) {
      const result = DefenseMechanism.sanitizePII(text);
      processedText = result.sanitizedText;
      wasRedacted = result.redacted;
    }

    try {
      // 3. 添加用户消息到历史
      this.conversationHistory.push({
        role: "user",
        content: processedText
      });

      // 4. 根据模型类型调用不同的 API
      let responseText: string;

      if (this.modelType === 'ollama') {
        responseText = await this.callOllama();
      } else if (this.modelType === 'vllm' || this.modelType === 'lmstudio') {
        responseText = await this.callOpenAICompatible();
      } else {
        throw new Error(`不支持的模型类型: ${this.modelType}`);
      }

      // 5. 添加助手回复到历史
      this.conversationHistory.push({
        role: "assistant",
        content: responseText
      });

      return {
        id: crypto.randomUUID(),
        text: responseText,
        sender: Sender.BOT,
        timestamp: Date.now(),
        isRedacted: wasRedacted
      };

    } catch (error) {
      console.error("本地模型 API 错误:", error);

      // 根据错误类型返回不同的提示
      let errorMessage = "抱歉，本地模型连接出现问题。";

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = `本地模型服务未启动或无法连接。\n\n请检查：\n- 服务是否运行在 ${this.modelUrl}\n- 模型 ${this.modelName} 是否已下载\n\n参考文档：local-deployment/README.md`;
      }

      return {
        id: crypto.randomUUID(),
        text: errorMessage,
        sender: Sender.SYSTEM,
        timestamp: Date.now()
      };
    }
  }

  /**
   * 调用 Ollama API
   */
  private async callOllama(): Promise<string> {
    const response = await fetch(`${this.modelUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: this.conversationHistory,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2048
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API 返回错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || "（模型未返回内容）";
  }

  /**
   * 调用 OpenAI 兼容的 API (vLLM, LM Studio)
   */
  private async callOpenAICompatible(): Promise<string> {
    const response = await fetch(`${this.modelUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error(`API 返回错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "（模型未返回内容）";
  }
}

export const localModelService = new LocalModelService();
