import { createContext, useContext, ReactNode } from 'react';
import { useViewportScale } from '../hooks/useViewportScale';

interface ViewportContextType {
  scale: number;
  width: number;
  height: number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

const ViewportContext = createContext<ViewportContextType>({
  scale: 1,
  width: 390,
  height: 844,
  safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
  keyboardHeight: 0,
  isKeyboardVisible: false,
});

export function SafeAreaProvider({ children }: { children: ReactNode }) {
  const viewportInfo = useViewportScale();

  return (
    <ViewportContext.Provider value={viewportInfo}>
      <div 
        className="w-full h-full"
        style={{
          // CSS custom properties for safe areas
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        }}
      >
        {children}
      </div>
    </ViewportContext.Provider>
  );
}

export function useViewport() {
  return useContext(ViewportContext);
}
