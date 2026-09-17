"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTOS_PER_PRODUCT,
  MAX_PHOTO_SIZE_BYTES,
  isValidPhotoFile,
} from "@/lib/supabase/storage";

export function PhotoPicker({
  existingUrls,
  onRemoveExisting,
  newFiles,
  onAddFiles,
  onRemoveNewFile,
  error,
}: {
  existingUrls: string[];
  onRemoveExisting: (url: string) => void;
  newFiles: File[];
  onAddFiles: (files: File[]) => void;
  onRemoveNewFile: (index: number) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const previewUrls = useMemo(
    () => newFiles.map((file) => URL.createObjectURL(file)),
    [newFiles]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const totalPhotos = existingUrls.length + newFiles.length;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList) return;
    setPickError(null);

    const remainingSlots = MAX_PHOTOS_PER_PRODUCT - totalPhotos;
    if (remainingSlots <= 0) {
      setPickError(`Maksimal ${MAX_PHOTOS_PER_PRODUCT} foto per produk.`);
      return;
    }

    const files = Array.from(fileList);
    const accepted: File[] = [];
    for (const file of files) {
      if (accepted.length >= remainingSlots) {
        setPickError(`Maksimal ${MAX_PHOTOS_PER_PRODUCT} foto per produk.`);
        break;
      }
      if (!isValidPhotoFile(file)) {
        setPickError(
          "Setiap foto harus berformat JPG/PNG/WEBP dan berukuran maksimal 5MB."
        );
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) {
      onAddFiles(accepted);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
        Foto produk (maks. {MAX_PHOTOS_PER_PRODUCT})
      </span>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {existingUrls.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(url)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-medium text-white"
              aria-label="Hapus foto"
            >
              ✕
            </button>
          </div>
        ))}

        {newFiles.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            {previewUrls[index] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrls[index]}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => onRemoveNewFile(index)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-medium text-white"
              aria-label="Hapus foto"
            >
              ✕
            </button>
          </div>
        ))}

        {totalPhotos < MAX_PHOTOS_PER_PRODUCT && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            <span className="text-xl leading-none">+</span>
            Tambah foto
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_PHOTO_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Format JPG/PNG/WEBP, maks. {MAX_PHOTO_SIZE_BYTES / (1024 * 1024)}MB per foto.
      </p>

      {(pickError || error) && (
        <p className="text-sm text-red-600 dark:text-red-400">{pickError ?? error}</p>
      )}
    </div>
  );
}
