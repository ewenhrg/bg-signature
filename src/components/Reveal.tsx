import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Extra delay in ms, staggers items inside a grid. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
};

const canObserve = typeof IntersectionObserver !== "undefined";

export function Reveal({ children, delay = 0, className = "", as = "div" }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  // Without IntersectionObserver, show the content straight away.
  const [visible, setVisible] = useState(!canObserve);

  useEffect(() => {
    const node = ref.current;
    if (!node || !canObserve) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "reveal-in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
