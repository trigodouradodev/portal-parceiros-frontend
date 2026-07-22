import { useCallback, useRef, type RefObject } from "react";

/**
 * Drag-to-scroll for overflow-x containers (mouse).
 * Touch/swipe keeps native behavior — only activates for pointerType === "mouse".
 * Mirrors portal-parceiros-design useDragScroll.
 *
 * Pass a ref owned by the caller so JSX can use `ref={elRef}` without
 * reading a RefObject out of a hook return object during render (react-hooks/refs).
 */
export function useDragScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;
      drag.current = {
        active: true,
        startX: e.clientX,
        startScroll: el.scrollLeft,
      };
      el.setPointerCapture(e.pointerId);
    },
    [ref],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el || !drag.current.active) return;
      el.scrollLeft =
        drag.current.startScroll - (e.clientX - drag.current.startX);
    },
    [ref],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      ref.current?.releasePointerCapture(e.pointerId);
    },
    [ref],
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}
