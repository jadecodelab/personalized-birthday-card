import CardPreview from "../components/CardPreview";
import {
  cardTemplates,
  defaultMovableLayouts,
  defaultPhotoScales,
  formatBirthdayDate,
  messagePresets,
} from "../lib/cardData";

const sampleTemplate = cardTemplates[0];
const sampleMessage = messagePresets[0];

export default function CardPage() {
  return (
    <main className="app-shell">
      <aside className="preview-panel" aria-label="Card preview">
        <div className="preview-header">
          <p className="eyebrow">Birthday Card</p>
          <span>{sampleTemplate.label} template</span>
        </div>
        <CardPreview
          interactive={false}
          templateId={sampleTemplate.id}
          movableLayout={defaultMovableLayouts[sampleTemplate.id]}
          photoScale={defaultPhotoScales[sampleTemplate.id]}
          photoPreviewUrl={null}
          previewName="Birthday Star"
          previewBirthday={formatBirthdayDate(6, 18)}
          message={{
            headline: sampleMessage.headline,
            body: sampleMessage.body,
          }}
        />
      </aside>
    </main>
  );
}
