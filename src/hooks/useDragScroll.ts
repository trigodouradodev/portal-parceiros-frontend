import { useCallback, useRef, type RefObject } from "react";

const DRAG_THRESHOLD_PX = 5;

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, label, [role="button"], [data-no-drag]',
    ),
  );
}

/**
 * Drag-to-scroll for overflow-x containers (mouse).
 * Touch/swipe keeps native behavior — only activates for pointerType === "mouse".
 * Mirrors portal-parceiros-design useDragScroll.
 *
 * Skips interactive targets and only captures the pointer after a small
 * movement threshold so clicks (e.g. contract number) still fire.
 *
 * Pass a ref owned by the caller so JSX can use `ref={elRef}` without
 * reading a RefObject out of a hook return object during render (react-hooks/refs).
 */
export function useDragScroll<T extends HTMLElement>(ref: RefObject<T | null>) {
  const drag = useRef({
    tracking: false,
    dragging: false,
    startX: 0,
    startScroll: 0,
    pointerId: -1,
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (isInteractiveTarget(e.target)) return;
      const el = ref.current;
      if (!el) return;
      drag.current = {
        tracking: true,
        dragging: false,
        startX: e.clientX,
        startScroll: el.scrollLeft,
        pointerId: e.pointerId,
      };
    },
    [ref],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      const state = drag.current;
      if (!el || !state.tracking) return;

      const deltaX = e.clientX - state.startX;

      if (!state.dragging) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;
        state.dragging = true;
        el.setPointerCapture(state.pointerId);
      }

      el.scrollLeft = state.startScroll - deltaX;
    },
    [ref],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent) => {
      const state = drag.current;
      if (!state.tracking) return;
      if (state.dragging) {
        ref.current?.releasePointerCapture(e.pointerId);
      }
      state.tracking = false;
      state.dragging = false;
      state.pointerId = -1;
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
