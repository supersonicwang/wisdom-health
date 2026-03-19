import React, { useState, useEffect, useRef } from 'react';
import { Sender, Message, DefenseStatus } from './types';
import { getAIService } from './services/serviceFactory';
import ChatMessage from './components/ChatMessage';
import DefensePanel from './components/DefensePanel';

const App: React.FC = () => {
  // 获取 AI 服务实例（根据环境变量自动选择云端或本地）
  const aiService = getAIService();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '**青囊先生**在此。\n\n即使是细微的不适，也可能反映身体阴阳的偏差。无论是体质调理、食疗养生，还是节气保养，皆可问我。\n\n为了您的安全，系统已启用**隐私保护**与**防御机制**。',
      sender: Sender.BOT,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [defenseStatus, setDefenseStatus] = useState<DefenseStatus>({
    privacyShield: true,
    adversarialGuard: true
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化 AI 服务
    aiService.startChat();
    console.log(`当前使用: ${aiService.getServiceName()}`);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggleDefense = (key: keyof DefenseStatus) => {
    setDefenseStatus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    // Add User Message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: userText,
      sender: Sender.USER,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 调用 AI 服务（自动使用云端或本地模型）
      const result = await aiService.sendMessage(
        userText,
        defenseStatus.privacyShield,
        defenseStatus.adversarialGuard
      );

      const botMsg: Message = {
        id: result.id || crypto.randomUUID(),
        text: result.text || "...",
        sender: result.sender || Sender.BOT,
        timestamp: result.timestamp || Date.now(),
        isRedacted: result.isRedacted,
        isBlocked: result.isBlocked
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      // Fallback system error
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: "系统暂时繁忙，请稍后再试。",
        sender: Sender.SYSTEM,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setInputValue(q);
  };

  return (
    <div className="flex h-screen bg-paper text-gray-800 font-sans overflow-hidden">
      
      {/* Sidebar - Desktop Only usually, keeping simple for mobile-first responsive */}
      <aside className="hidden md:flex flex-col w-80 bg-tcm-50 border-r border-tcm-200 h-full p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-tcm-700 rounded-lg flex items-center justify-center text-white font-serif text-xl font-bold shadow-lg">
            养
          </div>
          <h1 className="text-xl font-serif font-bold text-tcm-900 tracking-wide">中医养生卫士</h1>
        </div>

        <DefensePanel status={defenseStatus} onToggle={handleToggleDefense} />

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <h3 className="text-xs font-bold text-tcm-600 uppercase tracking-wider mb-4 mt-6">快捷问诊</h3>
          <div className="space-y-2">
            {[
              "我属于什么体质？",
              "最近总是失眠多梦怎么办？",
              "这种天气适合吃什么？",
              "湿气重有哪些表现？"
            ].map((q, i) => (
              <button 
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="w-full text-left p-3 text-sm text-gray-700 bg-white border border-tcm-100 rounded-lg hover:bg-tcm-100 hover:border-tcm-300 transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <h4 className="text-amber-800 font-bold text-xs mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              免责声明
            </h4>
            <p className="text-[10px] text-amber-700 leading-normal">
              本系统仅提供中医养生建议，不能替代专业医生的诊断和治疗。如遇急症重症，请立即前往医院就诊。
            </p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-tcm-50 border-b border-tcm-200 z-10">
           <div className="flex items-center gap-2">
             <div className="h-8 w-8 bg-tcm-700 rounded flex items-center justify-center text-white font-serif text-sm font-bold">
               养
             </div>
             <h1 className="text-lg font-serif font-bold text-tcm-900">中医养生卫士</h1>
           </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]">
          <div className="max-w-3xl mx-auto">
             {messages.map(msg => (
               <ChatMessage key={msg.id} message={msg} />
             ))}
             {isLoading && (
               <div className="flex justify-start mb-4 animate-pulse">
                  <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center space-x-2">
                    <div className="w-2 h-2 bg-tcm-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-tcm-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-tcm-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    <span className="text-xs text-tcm-500 font-serif ml-2">把脉思考中...</span>
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-tcm-200 shadow-lg z-20">
          <div className="max-w-3xl mx-auto">
            {/* Mobile Defense Toggles */}
            <div className="md:hidden flex gap-2 mb-2 overflow-x-auto pb-1">
               <button 
                 onClick={() => handleToggleDefense('privacyShield')}
                 className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${defenseStatus.privacyShield ? 'bg-tcm-100 border-tcm-300 text-tcm-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
               >
                 <span className={`w-2 h-2 rounded-full ${defenseStatus.privacyShield ? 'bg-tcm-500' : 'bg-gray-400'}`}></span>
                 隐私保护
               </button>
               <button 
                 onClick={() => handleToggleDefense('adversarialGuard')}
                 className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 ${defenseStatus.adversarialGuard ? 'bg-tcm-100 border-tcm-300 text-tcm-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
               >
                 <span className={`w-2 h-2 rounded-full ${defenseStatus.adversarialGuard ? 'bg-tcm-500' : 'bg-gray-400'}`}></span>
                 攻击防御
               </button>
            </div>

            <div className="relative flex items-end gap-2 bg-stone-50 p-2 rounded-xl border border-stone-300 focus-within:border-tcm-500 focus-within:ring-1 focus-within:ring-tcm-500 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="请描述您的症状，或询问养生建议..."
                className="w-full bg-transparent border-none text-gray-800 placeholder-gray-400 focus:ring-0 resize-none max-h-32 py-3 px-2 text-sm md:text-base scrollbar-hide"
                rows={1}
                style={{ minHeight: '44px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`flex-shrink-0 h-10 w-10 mb-1 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  !inputValue.trim() || isLoading
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-tcm-600 text-white hover:bg-tcm-700 shadow-md'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-2">
               <span className="text-[10px] text-gray-400">AI生成内容仅供参考，不作为医疗诊断依据</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;