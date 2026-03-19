import { GoogleGenAI, Chat, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Message, Sender } from "../types";
import { DefenseMechanism } from "./defenseService";
import { IAIService } from "./aiService";

const SYSTEM_INSTRUCTION = `
角色设定：
你是一位经验丰富、慈祥且严谨的中医养生专家（老中医）。你的名字叫“青囊先生”。
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

export class GeminiService implements IAIService {
  private ai: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;
  private modelId = 'gemini-2.5-flash';

  constructor() {}

  private ensureInitialized() {
    if (!this.ai) {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  public getServiceName(): string {
    return "Gemini Cloud (云端)";
  }

  /**
   * Initialize or reset the chat session
   */
  public startChat() {
    this.ensureInitialized();
    this.chatSession = this.ai!.chats.create({
      model: this.modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly creative for "TCM wisdom" feel but stable
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      },
    });
  }

  /**
   * Process user message through defense layers and send to Gemini
   */
  public async sendMessage(
    text: string, 
    enablePrivacy: boolean, 
    enableAdversarial: boolean
  ): Promise<Partial<Message>> {
    
    if (!this.chatSession) {
      this.startChat();
    }

    // 1. Adversarial Defense Layer
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

    // 2. Privacy Protection Layer
    let processedText = text;
    let wasRedacted = false;
    
    if (enablePrivacy) {
      const result = DefenseMechanism.sanitizePII(text);
      processedText = result.sanitizedText;
      wasRedacted = result.redacted;
    }

    try {
      // 3. Send to Gemini
      // Note: We send the *processed* text to the AI, ensuring PII doesn't leave the client if redacted.
      const result = await this.chatSession!.sendMessage({
        message: processedText
      });

      const responseText = result.text;

      return {
        id: crypto.randomUUID(),
        text: responseText,
        sender: Sender.BOT,
        timestamp: Date.now(),
        isRedacted: wasRedacted // Flag to UI that input was modified for privacy
      };

    } catch (error) {
      console.error("Gemini API Error:", error);
      return {
        id: crypto.randomUUID(),
        text: "抱歉，云端连接似乎有些不畅（气滞血瘀）。请稍后再试。",
        sender: Sender.SYSTEM,
        timestamp: Date.now()
      };
    }
  }
}

export const geminiService = new GeminiService();