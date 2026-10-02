"use client";

import { useEffect, useRef, useState } from "react";

interface MetricItem {
  targetValue: number;
  suffix?: string;
  unit: string;
  desc: string;
}

const METRICS: MetricItem[] = [
  {
    targetValue: 31,
    suffix: "",
    unit: "Kecamatan",
    desc: "Menghubungkan warga Surabaya dari barat hingga timur, utara hingga selatan.",
  },
  {
    targetValue: 0,
    suffix: "%",
    unit: "Komisi COD",
    desc: "Hasil penjualan 100% masuk kantong Anda tanpa potongan biaya perantara.",
  },
  {
    targetValue: 100,
    suffix: "%",
    unit: "Sirkular",
    desc: "Memperpanjang masa pakai barang guna menekan tumpukan limbah perabot & gadget.",
  },
];

function MetricCard({
  item,
  shouldAnimate,
}: {
  item: MetricItem;
  shouldAnimate: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    if (item.targetValue === 0) {
      setDisplayValue(0);
      return;
    }

    let startTime: number | null = null;
    const duration = 1600; // ms

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const nextVal = Math.round(easedProgress * item.targetValue);
      setDisplayValue(nextVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(item.targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldAnimate, item.targetValue]);

  return (
    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
      <div
        className="text-3xl sm:text-4xl lg:text-[44px] tracking-normal text-[#1C1819] dark:text-zinc-50 leading-[1.2] tabular-nums"
        style={{
          fontFamily: '"Reckless Neue", Didot, "Bodoni MT", serif',
          fontWeight: 300,
        }}
      >
        {displayValue}
        {item.suffix} {item.unit}
      </div>
      <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
        {item.desc}
      </p>
    </div>
  );
}

export function AnimatedMetrics() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-4 sm:py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
        {METRICS.map((item, idx) => (
          <MetricCard key={idx} item={item} shouldAnimate={isVisible} />
        ))}
      </div>
    </section>
  );
}
