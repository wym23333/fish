
import React from 'react';
import { Wifi } from 'lucide-react';

interface IOSStatusBarProps {
  theme?: 'light' | 'dark';
}

const IOSStatusBar: React.FC<IOSStatusBarProps> = ({ theme = 'dark' }) => {
  const isLight = theme === 'light';
  const colorClass = isLight ? 'text-white' : 'text-black';
  const barBgClass = isLight ? 'bg-white' : 'bg-black';
  const borderClass = isLight ? 'border-white/40' : 'border-black/30';

  return (
    <div className={`flex justify-between items-end px-6 pb-2 text-[15px] font-bold absolute top-0 left-0 right-0 z-[100] h-[44px] transition-all duration-500 bg-transparent pointer-events-none`}>
      <div className={`flex items-center ${colorClass}`}>
        <span>9:41</span>
      </div>
      <div className={`flex items-center gap-1.5 pb-0.5 ${colorClass}`}>
        <div className="flex gap-[2px] items-end h-3 mb-0.5">
          <div className={`w-[3px] h-[30%] rounded-[0.5px] ${barBgClass}`}></div>
          <div className={`w-[3px] h-[50%] rounded-[0.5px] ${barBgClass}`}></div>
          <div className={`w-[3px] h-[75%] rounded-[0.5px] ${barBgClass}`}></div>
          <div className={`w-[3px] h-[100%] rounded-[0.5px] ${barBgClass}`}></div>
        </div>
        <Wifi size={16} strokeWidth={2.5} />
        <div className={`relative w-[22px] h-[11px] border-[1.5px] rounded-[3px] ml-0.5 ${borderClass}`}>
            <div className={`absolute left-[1px] top-[1px] bottom-[1px] right-[4px] rounded-[1px] ${barBgClass}`}></div>
            <div className={`absolute -right-[3.5px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] rounded-r-full ${isLight ? 'bg-white/40' : 'bg-black/30'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default IOSStatusBar;
