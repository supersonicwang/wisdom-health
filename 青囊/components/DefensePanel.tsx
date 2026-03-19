import React from 'react';
import { DefenseStatus } from '../types';

interface DefensePanelProps {
  status: DefenseStatus;
  onToggle: (key: keyof DefenseStatus) => void;
}

const DefensePanel: React.FC<DefensePanelProps> = ({ status, onToggle }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-tcm-200 rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="text-tcm-800 font-serif font-bold text-sm mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        系统安全防御层
      </h3>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">隐私脱敏模式</span>
            <span className="text-xs text-gray-500">自动识别并过滤手机号、身份证等敏感信息</span>
          </div>
          <button 
            onClick={() => onToggle('privacyShield')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tcm-500 focus:ring-offset-2 ${status.privacyShield ? 'bg-tcm-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform duration-200 ${status.privacyShield ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">对抗攻击防御</span>
            <span className="text-xs text-gray-500">拦截恶意引导、越狱攻击及非健康类话题</span>
          </div>
          <button 
            onClick={() => onToggle('adversarialGuard')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tcm-500 focus:ring-offset-2 ${status.adversarialGuard ? 'bg-tcm-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform duration-200 ${status.adversarialGuard ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefensePanel;