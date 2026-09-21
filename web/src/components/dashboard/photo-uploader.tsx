"use client";

import {
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Alert, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  PHOTO_ACCEPT,
  describeRejection,
  uploadAdPhotos,
  type UploadedPhoto,
} from "@/lib/uploads/ad-photos";

type PhotoItem = {
  id: string;
  name: string;
  /** Present for a photo already on the ad; absent until a new one uploads. */
  url?: string;
  /** Present for a photo picked in this session and not yet uploaded. */
  file?: File;
  /** Object URL for a local file; revoked as soon as the tile goes away. */
  previewUrl?: string;
  progress: number;
  /** `invalid` is a client-side rejection; `failed` is a failed upload. */
  status: "ready" | "uploading" | "invalid" | "failed";
  error?: string;
};

export type PhotoUploaderHandle = {
  /**
   * Uploads whatever is still local and resolves with every photo URL in tile
   * order. Rejects if anything fails, so the caller can abort the save.
   */
  collect: () => Promise<string[]>;
};

function existingItem(url: string): PhotoItem {
  return {
    id: url,
    name: url.slice(url.lastIndexOf("/") + 1),
    url,
    progress: 100,
    status: "ready",
  };
}

function TileButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-full bg-neutral-950/65 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-neutral-950/85 disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * Picking a photo is free: it only makes an object URL for the preview.
 * Nothing touches the network until the form is submitted, so an abandoned
 * draft never leaves objects in the bucket and there is nothing to clean up.
 */
export function PhotoUploader({
  photos,
  ref,
}: {
  photos?: string[];
  ref?: RefObject<PhotoUploaderHandle | null>;
}) {
  const inputId = useId();
  const [items, setItems] = useState<PhotoItem[]>(() =>
    (photos ?? []).map(existingItem),
  );
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(
    () => () => {
      for (const item of itemsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
    },
    [],
  );

  const patch = useCallback((id: string, changes: Partial<PhotoItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
  }, []);

  const addFiles = useCallback((selected: File[]) => {
    if (selected.length === 0) return;

    const room = MAX_PHOTOS - itemsRef.current.length;
    if (room <= 0) {
      setNotice(`A listing can carry at most ${MAX_PHOTOS} photos.`);
      return;
    }
    setNotice(
      selected.length > room
        ? `Only the first ${room} of those were added — a listing can carry at most ${MAX_PHOTOS} photos.`
        : null,
    );

    const batch = selected.slice(0, room).map((file) => {
      const rejection = describeRejection(file);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        file: rejection ? undefined : file,
        previewUrl: rejection ? undefined : URL.createObjectURL(file),
        progress: 0,
        status: rejection ? ("invalid" as const) : ("ready" as const),
        error: rejection ?? undefined,
      };
    });

    setItems((prev) => [...prev, ...batch]);
  }, []);

  const collect = useCallback(async () => {
    const current = itemsRef.current;

    if (current.some((item) => item.status === "invalid")) {
      throw new Error(
        "Remove the photos marked in red before saving this listing.",
      );
    }

    const pending = current.filter((item) => item.file);
    if (pending.length === 0) {
      return current.flatMap((item) => (item.url ? [item.url] : []));
    }

    const markAll = (changes: Partial<PhotoItem>) => {
      for (const item of pending) patch(item.id, changes);
    };
    markAll({ status: "uploading", progress: 0, error: undefined });

    let uploaded: UploadedPhoto[];
    try {
      uploaded = await uploadAdPhotos(
        pending.map((item) => item.file as File),
        // The batch uploads as one multipart stream, so the bar is shared.
        (percent) => markAll({ progress: percent }),
      );
    } catch (error) {
      const message = (error as Error).message;
      markAll({ status: "failed", error: message });
      throw error;
    }

    const urlById = new Map(
      pending.map((item, index) => [item.id, uploaded[index].url]),
    );
    for (const [id, url] of urlById) {
      patch(id, { status: "ready", progress: 100, url, file: undefined });
    }

    // Tile order is the submitted order, so the cover stays the cover.
    return current.flatMap((item) => {
      const url = urlById.get(item.id) ?? item.url;
      return url ? [url] : [];
    });
  }, [patch]);

  useImperativeHandle(ref, () => ({ collect }), [collect]);

  const remove = useCallback((id: string) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setNotice(null);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const move = useCallback((id: string, offset: -1 | 1) => {
    setItems((prev) => {
      const from = prev.findIndex((item) => item.id === id);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }, []);

  const full = items.length >= MAX_PHOTOS;

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!full) addFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-border-strong bg-card px-4 py-7 text-center transition-[border-color,background-color] duration-150 hover:border-brand-300 hover:bg-brand-50/50",
          dragging && "border-brand-500 bg-brand-50",
          full &&
            "cursor-not-allowed opacity-55 hover:border-border-strong hover:bg-card",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-7 text-brand-700"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V4m0 0L8 8m4-4 4 4" />
          <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <span className="text-sm font-semibold text-foreground">
          {full ? "Photo limit reached" : "Drop photos here, or click to browse"}
        </span>
        <span className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or AVIF · up to {MAX_PHOTO_BYTES / (1024 * 1024)} MB
          each · {items.length}/{MAX_PHOTOS} added
        </span>
        <input
          id={inputId}
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          disabled={full}
          className="sr-only"
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            // Lets the same file be picked again after it was removed.
            event.target.value = "";
          }}
        />
      </label>

      {notice && <Alert variant="warning">{notice}</Alert>}

      {items.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            The first photo is the cover buyers see in search results. Photos
            upload when you save the listing.
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item, index) => {
              const broken = item.status === "invalid" || item.status === "failed";

              return (
                <li
                  key={item.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-150 shadow-sm ring-1 ring-neutral-900/5"
                >
                  {item.previewUrl || item.url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- blob previews and CDN photos, no remote-image config yet
                    <img
                      src={item.previewUrl ?? item.url}
                      alt={item.name}
                      className={cn(
                        "h-full w-full object-cover",
                        item.status === "uploading" && "opacity-60",
                      )}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center px-3 text-center text-2xs text-muted-foreground">
                      {item.name}
                    </span>
                  )}

                  {index === 0 && !broken && (
                    <Badge
                      variant="brand"
                      size="sm"
                      className="absolute left-1.5 top-1.5 shadow-xs"
                    >
                      Cover
                    </Badge>
                  )}

                  <div className="absolute right-1.5 top-1.5 flex gap-1">
                    <TileButton
                      label={`Move ${item.name} earlier`}
                      onClick={() => move(item.id, -1)}
                      className={cn(index === 0 && "pointer-events-none opacity-40")}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <path
                          d="M10 3 5 8l5 5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </TileButton>
                    <TileButton
                      label={`Move ${item.name} later`}
                      onClick={() => move(item.id, 1)}
                      className={cn(
                        index === items.length - 1 &&
                          "pointer-events-none opacity-40",
                      )}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <path
                          d="m6 3 5 5-5 5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </TileButton>
                    <TileButton
                      label={`Remove ${item.name}`}
                      onClick={() => remove(item.id)}
                    >
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
                        <path
                          d="m4 4 8 8M12 4l-8 8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </TileButton>
                  </div>

                  {item.status === "uploading" && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-neutral-950/25">
                      <div
                        className="h-full bg-brand-600 transition-[width] duration-200"
                        style={{ width: `${item.progress}%` }}
                        role="progressbar"
                        aria-label={`Uploading ${item.name}`}
                        aria-valuenow={item.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  )}

                  {broken && (
                    <p className="absolute inset-x-0 bottom-0 bg-danger-700/90 px-2 py-1.5 text-2xs leading-snug font-medium text-white">
                      {item.error}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
