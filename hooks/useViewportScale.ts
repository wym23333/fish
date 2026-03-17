import { useState, useEffect, useCallback } from 'react';

// Design base width in points (iPhone 14 Pro)
const DESIGN_WIDTH = 390;

interface ViewportInfo {
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

export function useViewportScale(): ViewportInfo {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>({
    scale: 1,
    width: DESIGN_WIDTH,
    height: 844,
    safeAreaInsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    keyboardHeight: 0,
    isKeyboardVisible: false,
  });

  const updateViewport = useCallback(() => {
    // Use visualViewport API for accurate measurements (especially on iOS)
    const vv = window.visualViewport;
    const width = vv?.width ?? window.innerWidth;
    const height = vv?.height ?? window.innerHeight;
    
    // Calculate scale based on design width
    const scale = width / DESIGN_WIDTH;

    // Get safe area insets from CSS env variables
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaInsets = {
      top: parseFloat(computedStyle.getPropertyValue('--sat') || '0') || 0,
      right: parseFloat(computedStyle.getPropertyValue('--sar') || '0') || 0,
      bottom: parseFloat(computedStyle.getPropertyValue('--sab') || '0') || 0,
      left: parseFloat(computedStyle.getPropertyValue('--sal') || '0') || 0,
    };

    // Detect keyboard visibility by comparing visualViewport height to window height
    const fullHeight = window.innerHeight;
    const currentHeight = vv?.height ?? fullHeight;
    const keyboardHeight = Math.max(0, fullHeight - currentHeight);
    const isKeyboardVisible = keyboardHeight > 100; // threshold for keyboard detection

    setViewportInfo({
      scale,
      width,
      height,
      safeAreaInsets,
      keyboardHeight,
      isKeyboardVisible,
    });
  }, []);

  useEffect(() => {
    // Set CSS custom properties for safe area insets
    const root = document.documentElement;
    root.style.setProperty('--sat', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--sar', 'env(safe-area-inset-right, 0px)');
    root.style.setProperty('--sab', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--sal', 'env(safe-area-inset-left, 0px)');

    // Initial update
    updateViewport();

    // Listen to visualViewport events (for iOS keyboard, zoom, etc.)
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateViewport);
      vv.addEventListener('scroll', updateViewport);
    }

    // Fallback resize listener
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport);
        vv.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, [updateViewport]);

  return viewportInfo;
}

// Utility to convert design pixels to scaled pixels
export function dp(value: number, scale: number): number {
  return value * scale;
}

// Utility to get CSS value with scale
export function dpCss(value: number, scale: number): string {
  return `${value * scale}px`;
}
