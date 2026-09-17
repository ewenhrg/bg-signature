import { useCallback, useEffect, useRef } from "react";

type Props = {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * Full-screen viewer. Uses object-contain so photos are never cropped here,
 * which complements the cropped banner/thumbnails elsewhere.
 */
export function Lightbox({ images, index, alt, onClose, onIndexChange }: Props) {
  const total = images.length;
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (!total) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, onIndexChange, total]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  if (!total) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-ink-950"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <div className="safe-px safe-pt flex items-center justify-between py-4">
        <span className="text-sm font-semibold text-white/70">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-2 pb-4 touch-pan-y"
        onClick={onClose}
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const startX = touchStartX.current;
          touchStartX.current = null;
          if (startX == null || total < 2) return;
          const endX = e.changedTouches[0]?.clientX ?? startX;
          const delta = endX - startX;
          if (Math.abs(delta) < 48) return;
          go(delta < 0 ? 1 : -1);
        }}
      >
        <img
          src={images[index]}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
          draggable={false}
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              aria-label="Photo précédente"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-ink-950/60 text-xl text-white transition hover:bg-ink-950/85 sm:left-6"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Photo suivante"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-ink-950/60 text-xl text-white transition hover:bg-ink-950/85 sm:right-6"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="scrollbar-hide safe-pb flex gap-2 overflow-x-auto px-3 pb-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onIndexChange(i)}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === index
                  ? "border-lagoon-400"
                  : "border-transparent opacity-55 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
