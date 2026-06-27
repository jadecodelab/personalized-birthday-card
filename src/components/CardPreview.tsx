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
import {
  BohoFloralGraphic,
  stickerGraphicContent,
  stickerGraphicViewBox,
} from "../lib/stickerGraphics";

const STICKER_ARIA_LABEL: Record<"cake" | "flowers" | "balloons" | "gift", string> = {
  cake: "Birthday cake sticker",
  flowers: "Flower sticker",
  balloons: "Balloon sticker",
  gift: "Gift box sticker",
};

type CardPreviewProps = {
  templateId: CardTemplateId;
  movableLayout: TemplateMovableLayout;
  activeStickerIds: MovableItemId[];
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
      activeStickerIds,
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
          {(["cake", "flowers", "balloons", "gift"] as const).map(
            (itemId) =>
              activeStickerIds.includes(itemId) && (
                <svg
                  key={itemId}
                  className={getItemClassName(
                    `card-graphic card-graphic--${itemId}`,
                    itemId,
                  )}
                  style={getItemStyle(itemId)}
                  viewBox={stickerGraphicViewBox[itemId]}
                  role="img"
                  aria-label={STICKER_ARIA_LABEL[itemId]}
                  tabIndex={interactive ? 0 : -1}
                  {...getItemPointerHandlers(itemId)}
                >
                  {stickerGraphicContent[itemId]}
                </svg>
              ),
          )}
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
        {templateId === "boho" && (
          <div className="boho-florals" aria-hidden="true">
            <span className="boho-floral boho-floral--one">
              <BohoFloralGraphic />
            </span>
            <span className="boho-floral boho-floral--two">
              <BohoFloralGraphic />
            </span>
          </div>
        )}
        {templateId !== "keepsake" && (
          <div className="card-copy">
            <p className="birthday-line">Celebrating {previewBirthday}</p>
            <p>Dear {previewName},</p>
            <h2>{message.headline}</h2>
            <p>{message.body}</p>
          </div>
        )}
      </div>
    );
  },
);

export default CardPreview;
