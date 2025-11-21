// InfiniteGalaxy/useWebWheelZoom.js
import React, { useEffect, useRef, useCallback } from "react";
import { clampW } from './StrategyUtils';
import { MAX_SCALE, MIN_ZOOM } from './StrategyConstants';

export function useWebWheelZoom(scale, tx, ty, isWeb) {
    const containerRef = useRef(null);

    const clampScale = s => clampW(s, MIN_ZOOM, MAX_SCALE);

    const onWheelCore = useCallback((ev) => {
        const rect = ev.currentTarget.getBoundingClientRect();
        const px = ev.clientX - rect.left;
        const py = ev.clientY - rect.top;
        const s0 = scale.value;
        const s1 = clampScale(s0 * Math.exp(-(ev.deltaY || 0) * 0.0015));
        tx.value = tx.value + (px / s1) - (px / s0);
        ty.value = ty.value + (py / s1) - (py / s0);
        scale.value = s1;
    }, [scale, tx, ty]);

    useEffect(() => {
        if (!isWeb) return;
        const el = containerRef.current;
        if (!el) return;
        const h = (e) => {
            e.preventDefault();
            onWheelCore(e);
        };
        el.addEventListener('wheel', h, { passive: false });
        return () => el.removeEventListener('wheel', h);
    }, [isWeb, onWheelCore]);

    return containerRef;
}