/**
 * Service Factory
 * 根据环境变量选择使用云端服务或本地服务
 */

import { IAIService } from './aiService';
import { geminiService } from './geminiService';
import { localModelService } from './localModelService';

const USE_LOCAL_MODEL = true;

export function getAIService(): IAIService {
  if (USE_LOCAL_MODEL) {
    console.log('🤖 使用本地模型服务');
    return localModelService;
  } else {
    console.log('☁️ 使用 Gemini 云端服务');
    return geminiService;
  }
}

export function getServiceType(): 'local' | 'cloud' {
  return USE_LOCAL_MODEL ? 'local' : 'cloud';
}
