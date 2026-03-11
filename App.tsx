
import React, { useState } from 'react';
import ChatView from './components/ChatView';
import ProfileView from './components/ProfileView';
import IOSStatusBar from './components/IOSStatusBar';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('chat');
  const [statusTheme, setStatusTheme] = useState<'light' | 'dark'>('dark');
  const [isHungry, setIsHungry] = useState(true);
  const [autoFeedOnEnter, setAutoFeedOnEnter] = useState(false);

  const isAquariumActive = currentPage === 'profile' && statusTheme === 'light';

  const handleNavigate = (page: Page, options?: { autoFeed?: boolean }) => {
    if (page === 'chat') {
      setIsHungry(true);
      setAutoFeedOnEnter(false);
    }
    if (page === 'profile' && options?.autoFeed) {
      setAutoFeedOnEnter(true);
    }
    setCurrentPage(page);
  };

  return (
    <div className={`h-full overflow-hidden select-none relative transition-colors duration-500 ${isAquariumActive ? 'bg-[#f8fafc]' : 'bg-white'}`}>
      <IOSStatusBar theme={currentPage === 'profile' ? statusTheme : 'dark'} />
      
      <div className="h-full w-full relative overflow-hidden">
        {currentPage === 'chat' ? (
          <div className="h-full animate-in fade-in duration-300">
            <ChatView 
              onNavigate={handleNavigate} 
              isHungry={isHungry}
            />
          </div>
        ) : (
          <div className="h-full animate-in slide-in-from-right duration-300">
            <ProfileView 
              onNavigate={handleNavigate} 
              onThemeChange={setStatusTheme}
              isHungry={isHungry}
              onFeedComplete={() => setIsHungry(false)}
              autoFeedOnEnter={autoFeedOnEnter}
              onAutoFeedDone={() => setAutoFeedOnEnter(false)}
            />
          </div>
        )}
      </div>

      {/* Global Home Indicator Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[24px] flex justify-center items-end z-[100] pointer-events-none bg-transparent">
        <div 
          className={`w-[134px] h-[5px] rounded-full mb-2 transition-all duration-500 ${
            isAquariumActive ? 'bg-black/20' : 'bg-black'
          }`} 
        />
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-in {
          animation-fill-mode: forwards;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-right { animation-name: slide-in-from-right; }
        .duration-300 { animation-duration: 300ms; }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
