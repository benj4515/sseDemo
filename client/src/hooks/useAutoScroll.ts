import {DependencyList, useEffect, useRef} from "react";

const DEFAULT_THRESHOLD = 40;

type UseAutoScrollOptions = {
    threshold?: number;
};

export const useAutoScroll = <T extends HTMLElement>(
    dependencies: DependencyList,
    options?: UseAutoScrollOptions
) => {
    const containerRef = useRef<T | null>(null);
    const shouldStickRef = useRef(true);
    const threshold = options?.threshold ?? DEFAULT_THRESHOLD;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const updateStickiness = () => {
            const distanceFromBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight;
            shouldStickRef.current = distanceFromBottom <= threshold;
        };

        container.addEventListener("scroll", updateStickiness);
        updateStickiness();

        return () => {
            container.removeEventListener("scroll", updateStickiness);
        };
    }, [threshold]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        if (shouldStickRef.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, dependencies);

    return { containerRef } as const;
};