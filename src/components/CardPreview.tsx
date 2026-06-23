import {
  forwardRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type {
  CardTemplateId,
  MovableItemId,
  ResizeCorner,
  TemplateMovableLayout,
} from "../lib/cardData";

type CardPreviewProps = {
  templateId: CardTemplateId;
  movableLayout: TemplateMovableLayout;
  photoScale: number;
  photoPreviewUrl: string | null;
  previewName: string;
  previewBirthday: string;
  message: { headline: string; body: string };
  interactive: boolean;
  selectedMovableItemId?: MovableItemId | null;
  activeMovableItemId?: MovableItemId | null;
  onItemPointerDown?: (
    event: PointerEvent<HTMLElement | SVGSVGElement>,
    itemId: MovableItemId,
  ) => void;
  onItemPointerMove?: (
    event: PointerEvent<HTMLElement | SVGSVGElement>,
    itemId: MovableItemId,
  ) => void;
  onItemPointerEnd?: (
    event: PointerEvent<HTMLElement | SVGSVGElement>,
    itemId: MovableItemId,
  ) => void;
  onBackgroundPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  onPhotoResizePointerDown?: (
    event: PointerEvent<HTMLButtonElement>,
    corner: ResizeCorner,
  ) => void;
  onPhotoResizePointerMove?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPhotoResizePointerEnd?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPhotoResizeMouseDown?: (
    event: MouseEvent<HTMLButtonElement>,
    corner: ResizeCorner,
  ) => void;
};

const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(
  function CardPreview(
    {
      templateId,
      movableLayout,
      photoScale,
      photoPreviewUrl,
      previewName,
      previewBirthday,
      message,
      interactive,
      selectedMovableItemId = null,
      activeMovableItemId = null,
      onItemPointerDown,
      onItemPointerMove,
      onItemPointerEnd,
      onBackgroundPointerDown,
      onPhotoResizePointerDown,
      onPhotoResizePointerMove,
      onPhotoResizePointerEnd,
      onPhotoResizeMouseDown,
    },
    forwardedRef,
  ) {
    function getItemStyle(itemId: MovableItemId) {
      const point = movableLayout[itemId];

      const style = {
        "--item-x": `${point.x}%`,
        "--item-y": `${point.y}%`,
      } as CSSProperties;

      if (itemId === "photo") {
        return {
          ...style,
          "--item-scale": `${photoScale / 100}`,
        } as CSSProperties;
      }

      return style;
    }

    function getItemClassName(baseClassName: string, itemId: MovableItemId) {
      return `${baseClassName} movable-card-item ${
        activeMovableItemId === itemId ? "is-dragging" : ""
      } ${selectedMovableItemId === itemId ? "is-selected" : ""}`;
    }

    function getItemPointerHandlers(itemId: MovableItemId) {
      if (!interactive) {
        return {};
      }

      return {
        onPointerDown: (event: PointerEvent<HTMLElement | SVGSVGElement>) =>
          onItemPointerDown?.(event, itemId),
        onPointerMove: (event: PointerEvent<HTMLElement | SVGSVGElement>) =>
          onItemPointerMove?.(event, itemId),
        onPointerUp: (event: PointerEvent<HTMLElement | SVGSVGElement>) =>
          onItemPointerEnd?.(event, itemId),
        onPointerCancel: (event: PointerEvent<HTMLElement | SVGSVGElement>) =>
          onItemPointerEnd?.(event, itemId),
      };
    }

    return (
      <div
        ref={forwardedRef}
        className={`card-preview card-preview--${templateId}`}
        onPointerDown={interactive ? onBackgroundPointerDown : undefined}
      >
        <div className="party-stickers" aria-hidden="true">
          <span className="sticker sticker--one" />
          <span className="sticker sticker--two" />
          <span className="sticker sticker--three" />
          <span className="sticker sticker--four" />
          <span className="sticker sticker--five" />
        </div>
        <div className="card-graphics">
          <svg
            className={getItemClassName("card-graphic card-graphic--cake", "cake")}
            style={getItemStyle("cake")}
            viewBox="0 0 140 140"
            role="img"
            aria-label="Birthday cake sticker"
            tabIndex={interactive ? 0 : -1}
            {...getItemPointerHandlers("cake")}
          >
            <path
              d="M24 113c12 8 80 8 92 0"
              fill="none"
              stroke="#7a3155"
              strokeLinecap="round"
              strokeWidth="8"
            />
            <rect x="34" y="72" width="72" height="36" rx="8" fill="#ff7aa8" />
            <path
              d="M34 82c8-8 15 8 23 0s15 8 23 0 15 8 26 0v14H34z"
              fill="#fff1f6"
            />
            <rect x="46" y="50" width="48" height="26" rx="7" fill="#ffd15c" />
            <path
              d="M46 60c7-7 12 7 18 0s12 7 18 0 8 5 12 0v12H46z"
              fill="#fff7cf"
            />
            <rect x="66" y="28" width="8" height="22" rx="3" fill="#4db6e8" />
            <path d="M70 14c10 12-1 18-1 18s-11-7 1-18z" fill="#ffcf3f" />
            <circle cx="50" cy="92" r="3" fill="#ffffff" />
            <circle cx="69" cy="94" r="3" fill="#ffffff" />
            <circle cx="88" cy="92" r="3" fill="#ffffff" />
          </svg>
          <svg
            className={getItemClassName(
              "card-graphic card-graphic--flowers",
              "flowers",
            )}
            style={getItemStyle("flowers")}
            viewBox="0 0 150 150"
            role="img"
            aria-label="Flower sticker"
            tabIndex={interactive ? 0 : -1}
            {...getItemPointerHandlers("flowers")}
          >
            <path
              d="M71 134c-2-28 3-50 12-72"
              fill="none"
              stroke="#277b73"
              strokeLinecap="round"
              strokeWidth="7"
            />
            <path
              d="M73 104c-20-8-31-22-32-42 22 3 34 16 32 42z"
              fill="#59c6a4"
            />
            <path
              d="M84 92c19-8 31-20 36-38-22 1-36 13-36 38z"
              fill="#74d6bc"
            />
            <circle cx="76" cy="54" r="10" fill="#ffcf3f" />
            <circle cx="76" cy="31" r="17" fill="#ff8fb3" />
            <circle cx="100" cy="54" r="17" fill="#ff8fb3" />
            <circle cx="76" cy="77" r="17" fill="#ff8fb3" />
            <circle cx="52" cy="54" r="17" fill="#ff8fb3" />
            <circle cx="76" cy="54" r="15" fill="#fff7cf" />
          </svg>
          <svg
            className={getItemClassName(
              "card-graphic card-graphic--balloons",
              "balloons",
            )}
            style={getItemStyle("balloons")}
            viewBox="0 0 140 160"
            role="img"
            aria-label="Balloon sticker"
            tabIndex={interactive ? 0 : -1}
            {...getItemPointerHandlers("balloons")}
          >
            <path
              d="M50 68c-9 30 14 52 2 84M90 72c4 28-16 48-9 80"
              fill="none"
              stroke="#7a3155"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <ellipse cx="48" cy="46" rx="27" ry="35" fill="#4d9de0" />
            <ellipse cx="91" cy="48" rx="27" ry="35" fill="#ff6b94" />
            <path d="M43 78h12l-6 11z" fill="#4d9de0" />
            <path d="M86 80h12l-6 11z" fill="#ff6b94" />
            <circle cx="39" cy="32" r="7" fill="#ffffff" opacity="0.72" />
            <circle cx="82" cy="34" r="7" fill="#ffffff" opacity="0.72" />
          </svg>
          <svg
            className={getItemClassName("card-graphic card-graphic--gift", "gift")}
            style={getItemStyle("gift")}
            viewBox="0 0 140 140"
            role="img"
            aria-label="Gift box sticker"
            tabIndex={interactive ? 0 : -1}
            {...getItemPointerHandlers("gift")}
          >
            <rect x="29" y="60" width="82" height="56" rx="8" fill="#31c6b4" />
            <rect x="62" y="60" width="16" height="56" fill="#ffcf3f" />
            <rect x="22" y="48" width="96" height="20" rx="7" fill="#ff6b94" />
            <rect x="63" y="48" width="14" height="20" fill="#ffcf3f" />
            <path
              d="M68 48c-22-2-28-20-16-27 12-7 18 15 18 27"
              fill="none"
              stroke="#ffcf3f"
              strokeLinecap="round"
              strokeWidth="8"
            />
            <path
              d="M73 48c22-2 28-20 16-27-12-7-18 15-18 27"
              fill="none"
              stroke="#ffcf3f"
              strokeLinecap="round"
              strokeWidth="8"
            />
          </svg>
        </div>
        <div
          className={getItemClassName("card-ribbon", "ribbon")}
          style={getItemStyle("ribbon")}
          role="img"
          aria-label="Happy Birthday tag"
          tabIndex={interactive ? 0 : -1}
          {...getItemPointerHandlers("ribbon")}
        >
          Happy Birthday
        </div>
        <div
          className={getItemClassName(
            `photo-placeholder ${photoPreviewUrl ? "photo-placeholder--filled" : ""}`,
            "photo",
          )}
          style={getItemStyle("photo")}
          role="group"
          aria-label="Photo frame. Drag to move, or drag a corner handle to resize."
          tabIndex={interactive ? 0 : -1}
          {...getItemPointerHandlers("photo")}
        >
          {photoPreviewUrl ? (
            <img
              src={photoPreviewUrl}
              alt={`Uploaded photo for ${previewName}`}
              draggable={false}
            />
          ) : (
            <span>Photo</span>
          )}
          {interactive && (
            <div className="photo-resize-handles" aria-hidden="true">
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <button
                  key={corner}
                  className={`photo-resize-handle photo-resize-handle--${corner}`}
                  type="button"
                  tabIndex={-1}
                  aria-label={`Resize photo ${corner}`}
                  onPointerDown={(event) =>
                    onPhotoResizePointerDown?.(event, corner)
                  }
                  onPointerMove={onPhotoResizePointerMove}
                  onPointerUp={onPhotoResizePointerEnd}
                  onPointerCancel={onPhotoResizePointerEnd}
                  onMouseDown={(event) =>
                    onPhotoResizeMouseDown?.(event, corner)
                  }
                />
              ))}
            </div>
          )}
        </div>
        <div className="card-copy">
          <p className="birthday-line">Celebrating {previewBirthday}</p>
          <p>Dear {previewName},</p>
          <h2>{message.headline}</h2>
          <p>{message.body}</p>
        </div>
      </div>
    );
  },
);

export default CardPreview;
