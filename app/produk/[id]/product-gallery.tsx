"use client";

import { useState } from "react";

export function ProductGallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
        Tanpa foto
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[activeIndex]}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {photos.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-lg border-2 ${
                index === activeIndex
                  ? "border-zinc-950 dark:border-zinc-50"
                  : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
