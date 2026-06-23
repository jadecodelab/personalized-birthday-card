import CardPreview from "../components/CardPreview";
import EnvelopeReveal from "../components/EnvelopeReveal";
import {
  cardTemplates,
  defaultMovableLayouts,
  defaultPhotoScales,
  formatBirthdayDate,
  messagePresets,
} from "../lib/cardData";
import { decodeCardLink } from "../lib/cardLink";

const sampleTemplate = cardTemplates[0];
const sampleMessage = messagePresets[0];

export default function CardPage() {
  // The card payload lives in the URL fragment (#d=...), not the query
  // string, so it never gets sent to the server.
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const encoded = hashParams.get("d");
  const sharedCard = encoded ? decodeCardLink(encoded) : null;

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
  const photoScale = sharedCard?.photoScale ?? defaultPhotoScales[templateId];
  const photoPreviewUrl = sharedCard?.photoDataUrl ?? null;

  return (
    <main className="app-shell">
      <aside className="preview-panel" aria-label="Card preview">
        <div className="preview-header">
          <p className="eyebrow">Birthday Card</p>
          <span>{templateLabel} template</span>
        </div>
        {!sharedCard && (
          <p className="preview-guide">
            This is a demo card. Open a real card link to see one made for you.
          </p>
        )}
        <EnvelopeReveal recipientName={previewName}>
          <CardPreview
            interactive={false}
            templateId={templateId}
            movableLayout={movableLayout}
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
