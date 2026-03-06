import { useRef, useCallback, useEffect } from 'react';

interface SwipeOptions {
    onSwipeLeft: () => void;   // Next question
    onSwipeRight: () => void;  // Previous question
    threshold?: number;         // Minimum swipe distance (default 50px)
    enabled?: boolean;         // Enable/disable swipe (default true)
}

export function useSwipeNavigation({
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    enabled = true,
}: SwipeOptions) {
    const ref = useRef<HTMLDivElement>(null);
    const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
    const isSwiping = useRef(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (!enabled) return;
        const touch = e.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        isSwiping.current = false;
    }, [enabled]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!enabled || !touchStart.current) return;
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - touchStart.current.x);
        const dy = Math.abs(touch.clientY - touchStart.current.y);

        // If horizontal movement > vertical, it's a swipe — prevent scroll
        if (dx > dy && dx > 10) {
            isSwiping.current = true;
            e.preventDefault();
        }
    }, [enabled]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        if (!enabled || !touchStart.current || !isSwiping.current) {
            touchStart.current = null;
            return;
        }

        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStart.current.x;
        const elapsed = Date.now() - touchStart.current.time;

        // Must exceed threshold and complete within 500ms
        if (Math.abs(dx) >= threshold && elapsed < 500) {
            if (dx < 0) {
                onSwipeLeft(); // Swipe left → Next
            } else {
                onSwipeRight(); // Swipe right → Previous
            }
        }

        touchStart.current = null;
        isSwiping.current = false;
    }, [enabled, threshold, onSwipeLeft, onSwipeRight]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchmove', handleTouchMove, { passive: false });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchmove', handleTouchMove);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return ref;
}
