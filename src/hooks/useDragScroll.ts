import { useRef } from "react";

/**
 * Drag-to-scroll for overflow-x containers (mouse).
 * Touch/swipe keeps native behavior — only activates for pointerType === "mouse".
 * Mirrors portal-parceiros-design useDragScroll.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0 });

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
    };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    el.scrollLeft =
      drag.current.startScroll - (e.clientX - drag.current.startX);
  }

  function endDrag(e: React.PointerEvent) {
    if (!drag.current.active) return;
    drag.current.active = false;
    ref.current?.releasePointerCapture(e.pointerId);
  }

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };
}
