"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/** Distance a touch must travel before it counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 48;
/** Movement past this is a drag, so it must not also register as a tap. */
const TAP_SLOP = 6;
const DOUBLE_TAP_MS = 320;

const MIN_SCALE = 1;
const MAX_SCALE = 5;
/** Where a double-tap lands: close enough to read a room, still framed. */
const DOUBLE_TAP_SCALE = 2.5;
const STEP = 1.4;

type View = { scale: number; x: number; y: number };

const RESET: View = { scale: 1, x: 0, y: 0 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Keeps the photo from being dragged off the screen: at any scale it may be
 * panned only as far as the part that overflows the stage.
 */
function clampOffset(
  x: number,
  y: number,
  scale: number,
  stage: HTMLElement | null,
  image: HTMLElement | null,
): { x: number; y: number } {
  if (!stage || !image || scale <= 1) return { x: 0, y: 0 };
  const maxX = Math.max(0, (image.offsetWidth * scale - stage.clientWidth) / 2);
  const maxY = Math.max(0, (image.offsetHeight * scale - stage.clientHeight) / 2);
  return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

function ToolbarButton({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

/**
 * Full-screen photo viewer. Rendered in a portal on `document.body` so the
 * detail page's stacking contexts and `overflow-hidden` cards cannot clip it.
 */
export function AdLightbox({
  photos,
  title,
  index,
  onIndexChange,
  onClose,
}: {
  photos: string[];
  title: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [view, setView] = useState<View>(RESET);
  const [dragging, setDragging] = useState(false);

  /* Active pointers, so one finger pans and two pinch. */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const gesture = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const lastTap = useRef(0);
  /** A drag that ends on the backdrop must not also be read as a click. */
  const dragged = useRef(false);
  /**
   * Whether the press began on the dark surround rather than the photo or a
   * control. Recorded on pointerdown because pointer capture retargets the
   * click that follows to the stage, making the click's own target useless
   * for telling the two apart.
   */
  const fromBackdrop = useRef(false);

  const count = photos.length;
  const zoomed = view.scale > 1;

  /* Every photo starts fresh rather than inheriting the last one's zoom, so
   * the reset rides along with the move instead of chasing it in an effect. */
  const select = useCallback(
    (next: number) => {
      setView(RESET);
      onIndexChange(next);
    },
    [onIndexChange],
  );

  // Wrapping round makes the arrows usable at either end without dead ends.
  const go = useCallback(
    (delta: number) => select((index + delta + count) % count),
    [count, index, select],
  );

  /** Zooms around a focal point given relative to the stage centre. */
  const zoomTo = useCallback((next: number, focalX = 0, focalY = 0) => {
    setView((current) => {
      const scale = clamp(next, MIN_SCALE, MAX_SCALE);
      if (scale === MIN_SCALE) return RESET;

      // Keeps whatever sits under the cursor pinned there as the scale moves.
      const ratio = scale / current.scale;
      const x = focalX - (focalX - current.x) * ratio;
      const y = focalY - (focalY - current.y) * ratio;
      const bounded = clampOffset(
        x,
        y,
        scale,
        stageRef.current,
        imageRef.current,
      );
      return { scale, ...bounded };
    });
  }, []);

  const focalFrom = useCallback((clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - (rect.left + rect.width / 2),
      y: clientY - (rect.top + rect.height / 2),
    };
  }, []);

  const toggleZoom = useCallback(
    (clientX: number, clientY: number) => {
      const focal = focalFrom(clientX, clientY);
      setView((current) =>
        current.scale > 1
          ? RESET
          : {
              scale: DOUBLE_TAP_SCALE,
              ...clampOffset(
                focal.x - focal.x * DOUBLE_TAP_SCALE,
                focal.y - focal.y * DOUBLE_TAP_SCALE,
                DOUBLE_TAP_SCALE,
                stageRef.current,
                imageRef.current,
              ),
            },
      );
    },
    [focalFrom],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowRight") {
        go(1);
      } else if (event.key === "ArrowLeft") {
        go(-1);
      } else if (event.key === "+" || event.key === "=") {
        zoomTo(view.scale * STEP);
      } else if (event.key === "-" || event.key === "_") {
        zoomTo(view.scale / STEP);
      } else if (event.key === "0") {
        setView(RESET);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, onClose, view.scale, zoomTo]);

  /* Wheel and trackpad pinch. Bound natively because React's wheel listener
   * is passive, and this one has to call preventDefault to stop the page
   * behind it from zooming with the gesture. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const focal = focalFrom(event.clientX, event.clientY);
      setView((current) => {
        const scale = clamp(
          current.scale * Math.exp(-event.deltaY / 300),
          MIN_SCALE,
          MAX_SCALE,
        );
        if (scale === MIN_SCALE) return RESET;
        const ratio = scale / current.scale;
        const x = focal.x - (focal.x - current.x) * ratio;
        const y = focal.y - (focal.y - current.y) * ratio;
        return {
          scale,
          ...clampOffset(x, y, scale, stageRef.current, imageRef.current),
        };
      });
    }

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [focalFrom]);

  // The page behind must not scroll while the viewer owns the screen.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  /* Focus moves into the viewer so Escape and the arrow keys reach it even
   * when the click landed on an image rather than a control. */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  function onPointerDown(event: React.PointerEvent) {
    fromBackdrop.current = event.target === event.currentTarget;

    /* The arrows live inside the stage. Capturing the pointer here would
     * retarget the mouse events that follow to the stage, so the browser
     * would synthesise the click on the stage instead of the button and the
     * arrow would never fire. Gestures start on the photo, not on a control. */
    if ((event.target as HTMLElement).closest('button')) return;

    dragged.current = false;
    stageRef.current?.setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    setDragging(true);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        scale: view.scale,
      };
      gesture.current = null;
      return;
    }

    gesture.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
      moved: false,
    };
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const focal = focalFrom((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomTo(
        (pinch.current.scale * distance) / pinch.current.distance,
        focal.x,
        focal.y,
      );
      return;
    }

    const drag = gesture.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > TAP_SLOP) {
      drag.moved = true;
      dragged.current = true;
    }

    // At 1× there is nothing to pan, so the same drag means "next photo".
    if (view.scale <= 1) return;

    setView((current) => ({
      scale: current.scale,
      ...clampOffset(
        drag.originX + dx,
        drag.originY + dy,
        current.scale,
        stageRef.current,
        imageRef.current,
      ),
    }));
  }

  function onPointerUp(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setDragging(false);

    const drag = gesture.current;
    if (!drag || pointers.current.size > 0) return;
    gesture.current = null;

    if (drag.moved) {
      // A swipe only navigates while the photo is not zoomed in.
      if (view.scale <= 1 && count > 1) {
        const travel = event.clientX - drag.startX;
        if (Math.abs(travel) >= SWIPE_THRESHOLD) go(travel < 0 ? 1 : -1);
      }
      return;
    }

    /* Double-tap is detected here rather than left to `dblclick`, which does
     * not fire reliably on touch. */
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      toggleZoom(event.clientX, event.clientY);
    } else {
      lastTap.current = now;
    }
  }

  const percent = Math.round(view.scale * 100);

  // Only ever mounted from a click, so `document` is always there to portal into.
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photo ${index + 1} of ${count}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-neutral-950/95 outline-none backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="min-w-0 truncate text-sm font-medium">{title}</p>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="mr-1 flex items-center gap-0.5 rounded-full bg-white/10 px-1 py-0.5">
            <ToolbarButton
              onClick={() => zoomTo(view.scale / STEP)}
              label="Zoom out"
              disabled={view.scale <= MIN_SCALE}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M8.5 11h5M20 20l-4.4-4.4" />
              </svg>
            </ToolbarButton>

            {/* Doubles as the reset control — the obvious place to click to
             * get back to the whole photo. */}
            <button
              type="button"
              onClick={() => setView(RESET)}
              disabled={!zoomed}
              aria-label={`Zoom level ${percent}%. Reset to fit`}
              title="Reset zoom"
              className="numeric min-w-[3.25rem] rounded-full px-1 text-center text-xs font-semibold tabular-nums text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:text-white/50"
            >
              {percent}%
            </button>

            <ToolbarButton
              onClick={() => zoomTo(view.scale * STEP)}
              label="Zoom in"
              disabled={view.scale >= MAX_SCALE}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M8.5 11h5M11 8.5v5M20 20l-4.4-4.4" />
              </svg>
            </ToolbarButton>
          </div>

          <span className="numeric text-sm tabular-nums text-white/70">
            {index + 1} / {count}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Clicks inside the stage must not reach the backdrop's close handler. */}
      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 sm:px-16"
        style={{ touchAction: "none" }}
        /* Only a press that began on the dark surround should close — one on
         * the photo or a control must not, and neither should the click that
         * ends a pan. */
        onClick={(event) => {
          if (!fromBackdrop.current || dragged.current) {
            event.stopPropagation();
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {count > 1 && !zoomed && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute left-1 z-10 flex size-11 items-center justify-center rounded-full bg-neutral-950/50 text-white/90 transition-colors hover:bg-neutral-950/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:left-4"
          >
            <ChevronIcon className="size-6" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element -- external placeholder photos, no remote-image config yet */}
        <img
          ref={imageRef}
          key={photos[index]}
          src={photos[index]}
          alt={`${title} — photo ${index + 1} of ${count}`}
          draggable={false}
          className={cn(
            "max-h-full max-w-full select-none object-contain",
            zoomed ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in",
            !dragging && "transition-transform duration-200 ease-soft",
          )}
          style={{
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
          }}
        />

        {count > 1 && !zoomed && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute right-1 z-10 flex size-11 items-center justify-center rounded-full bg-neutral-950/50 text-white/90 transition-colors hover:bg-neutral-950/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-4"
          >
            <ChevronIcon className="size-6 rotate-180" />
          </button>
        )}

      </div>

      {count > 1 && (
        <div
          className="shrink-0 overflow-x-auto px-4 py-4 sm:px-6"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto flex w-max gap-2">
            {photos.map((photo, thumbIndex) => (
              <button
                key={`${thumbIndex}-${photo}`}
                type="button"
                onClick={() => select(thumbIndex)}
                aria-label={`Show photo ${thumbIndex + 1}`}
                aria-current={thumbIndex === index || undefined}
                className={cn(
                  "h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition-opacity focus-visible:outline-none focus-visible:ring-white",
                  thumbIndex === index
                    ? "opacity-100 ring-white"
                    : "opacity-55 ring-transparent hover:opacity-90",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external placeholder photos, no remote-image config yet */}
                <img
                  src={photo}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
