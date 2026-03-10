import { useState, useEffect } from 'react';

export interface TouchDeviceInfo {
  isTouch: boolean;
  isMobileDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasHover: boolean;
}

export const useTouchDevice = (): TouchDeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<TouchDeviceInfo>({
    isTouch: false,
    isMobileDevice: false,
    isIOS: false,
    isAndroid: false,
    hasHover: true,
  });

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMobileDevice = isIOS || isAndroid || /Mobile|Tablet/.test(userAgent);
    
    const hasHover = window.matchMedia('(hover: hover)').matches;

    setDeviceInfo({
      isTouch,
      isMobileDevice,
      isIOS,
      isAndroid,
      hasHover,
    });
  }, []);

  return deviceInfo;
};
