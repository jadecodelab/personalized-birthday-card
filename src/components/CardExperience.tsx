import CardPreview from "./CardPreview";
import EnvelopeReveal from "./EnvelopeReveal";
import {
  cardTemplates,
  defaultMovableLayouts,
  defaultPhotoScales,
  formatBirthdayDate,
  messagePresets,
  stickerCatalog,
} from "../lib/cardData";
import type { SharedCardPayload } from "../lib/cardLink";

const sampleTemplate = cardTemplates[0];
const sampleMessage = messagePresets[0];

type CardExperienceProps = {
  sharedCard: SharedCardPayload | null;
};

// The actual envelope-reveal experience, shared by CardPage.tsx (decodes a
// `/card#d=...` fragment synchronously) and ShortCardPage.tsx (fetches a
// `/c/<id>` payload asynchronously) - both just need to hand this a
// SharedCardPayload, or null for the no-link demo card.
export default function CardExperience({ sharedCard }: CardExperienceProps) {
  const templateId = sharedCard?.templateId ?? sampleTemplate.id;
  const templateLabel =
    cardTemplates.find((template) => template.id === templateId)?.label ??
    sampleTemplate.label;
  const previewName = (sharedCard ? sharedCard.name.trim() : "") || "Birthday Star";
  const previewBirthday = sharedCard
    ? formatBirthdayDate(sharedCard.month, sharedCard.day)
    : formatBirthdayDate(6, 18);
  const message = sharedCard
    ? { headline: sharedCard.headline, body: sharedCard.body }
    : { headline: sampleMessage.headline, body: sampleMessage.body };
  const movableLayout = sharedCard?.layout ?? defaultMovableLayouts[templateId];
  // The no-link demo card shows every sticker/tag so it reads as a finished
  // example; a real shared card faithfully reflects what the sender added.
  const activeStickerIds =
    sharedCard?.activeStickers ?? stickerCatalog.map((sticker) => sticker.id);
  const photoScale = sharedCard?.photoScale ?? defaultPhotoScales[templateId];
  const photoPreviewUrl = sharedCard?.photoDataUrl ?? null;

  return (
    <main className="app-shell">
      <aside className="preview-panel" aria-label="Card preview">
        {!sharedCard && (
          <div className="preview-header">
            <p className="eyebrow">Birthday Card</p>
            <span>{templateLabel} template</span>
          </div>
        )}
        {!sharedCard && (
          <p className="preview-guide">
            This is a demo card. Open a real card link to see one made for you.
          </p>
        )}
        {sharedCard && (
          <p className="arrival-line">Someone made something special for you</p>
        )}
        <EnvelopeReveal recipientName={previewName}>
          <CardPreview
            interactive={false}
            templateId={templateId}
            movableLayout={movableLayout}
            activeStickerIds={activeStickerIds}
            photoScale={photoScale}
            photoPreviewUrl={photoPreviewUrl}
            previewName={previewName}
            previewBirthday={previewBirthday}
            message={message}
          />
        </EnvelopeReveal>
      </aside>
    </main>
  );
}
