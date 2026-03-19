/**
 * AI Service Interface
 * 统一的 AI 服务接口，支持云端和本地模型
 */

import { Message } from '../types';

export interface IAIService {
  /**
   * 初始化或重置对话会话
   */
  startChat(): void;

  /**
   * 发送消息到 AI 服务
   * @param text 用户输入的文本
   * @param enablePrivacy 是否启用隐私保护
   * @param enableAdversarial 是否启用对抗防御
   */
  sendMessage(
    text: string,
    enablePrivacy: boolean,
    enableAdversarial: boolean
  ): Promise<Partial<Message>>;

  /**
   * 获取服务名称（用于 UI 显示）
   */
  getServiceName(): string;
}
