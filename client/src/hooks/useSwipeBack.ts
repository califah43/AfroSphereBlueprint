import { useEffect } from 'react';

interface UseSwipeBackProps {
  onSwipeBack: () => void;
  enabled?: boolean;
}

export function useSwipeBack({ onSwipeBack, enabled = true }: UseSwipeBackProps) {
  useEffect(() => {
    if (!enabled) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isTrackingSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only track swipes from left edge (first 30px)
      if (e.touches[0].clientX < 30) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTrackingSwipe = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTrackingSwipe) return;

      const touchCurrentX = e.touches[0].clientX;
      const touchCurrentY = e.touches[0].clientY;
      const diffX = touchCurrentX - touchStartX;
      const diffY = Math.abs(touchCurrentY - touchStartY);

      // If moved right more than 100px and vertical movement is small (straight swipe)
      if (diffX > 100 && diffY < 50) {
        onSwipeBack();
        isTrackingSwipe = false;
      }
    };

    const handleTouchEnd = () => {
      isTrackingSwipe = false;
    };

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeBack, enabled]);
}
