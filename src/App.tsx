import { useEffect, useRef, useState, type ChangeEvent } from "react";

const months = [
  { name: "January", days: 31 },
  { name: "February", days: 29 },
  { name: "March", days: 31 },
  { name: "April", days: 30 },
  { name: "May", days: 31 },
  { name: "June", days: 30 },
  { name: "July", days: 31 },
  { name: "August", days: 31 },
  { name: "September", days: 30 },
  { name: "October", days: 31 },
  { name: "November", days: 30 },
  { name: "December", days: 31 },
];

const messagePresets = [
  {
    id: "warm",
    label: "Warm",
    headline: "Wishing you a day full of joy.",
    body: "May this year bring bright moments, good people, and the kind of memories you keep smiling about.",
  },
  {
    id: "funny",
    label: "Funny",
    headline: "Another year wiser, somehow still this fun.",
    body: "Hope your birthday is packed with cake, laughs, and absolutely no boring grown-up responsibilities.",
  },
  {
    id: "heartfelt",
    label: "Heartfelt",
    headline: "You make life brighter just by being you.",
    body: "Today is the perfect excuse to celebrate your kindness, your spark, and all the ways you are loved.",
  },
];

const cardTemplates = [
  { id: "elegant", label: "Sweet" },
  { id: "playful", label: "Confetti" },
  { id: "bold", label: "Pop Art" },
  { id: "photo", label: "Photo Fun" },
] as const;

type CardTemplateId = (typeof cardTemplates)[number]["id"];

function formatBirthdayDate(monthIndex: number, day: number) {
  const month = months[monthIndex];

  if (!month || !day) {
    return "Choose a birthday date";
  }

  return `${month.name} ${day}`;
}

export default function App() {
  const [recipientName, setRecipientName] = useState("Snoopy");
  const [birthdayMonth, setBirthdayMonth] = useState(7);
  const [birthdayDay, setBirthdayDay] = useState(18);
  const [selectedMessageId, setSelectedMessageId] = useState("warm");
  const [messageHeadline, setMessageHeadline] = useState(
    messagePresets[0].headline,
  );
  const [messageBody, setMessageBody] = useState(messagePresets[0].body);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<CardTemplateId>("elegant");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const previewName = recipientName.trim() || "Birthday Star";
  const selectedMessage = {
    headline: messageHeadline.trim() || "Add your own birthday card headline.",
    body: messageBody.trim() || "Write your own birthday message to see it here.",
  };
  const availableDays = Array.from(
    { length: months[birthdayMonth].days },
    (_, index) => index + 1,
  );
  const previewBirthday = formatBirthdayDate(birthdayMonth, birthdayDay);
  const selectedTemplate =
    cardTemplates.find((template) => template.id === selectedTemplateId) ??
    cardTemplates[0];
  const cardPreviewClassName = `card-preview card-preview--${selectedTemplate.id}`;

  function handleBirthdayMonthChange(value: string) {
    const nextMonth = Number(value);
    const maxDay = months[nextMonth].days;

    setBirthdayMonth(nextMonth);
    setBirthdayDay((currentDay) => Math.min(currentDay, maxDay));
  }

  function handleMessagePresetSelect(message: (typeof messagePresets)[number]) {
    setSelectedMessageId(message.id);
    setMessageHeadline(message.headline);
    setMessageBody(message.body);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoPreviewUrl(URL.createObjectURL(file));
    setPhotoFileName(file.name);
  }

  function handleRemovePhoto() {
    setPhotoPreviewUrl(null);
    setPhotoFileName("");

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  }

  useEffect(() => {
    if (!photoPreviewUrl) {
      return;
    }

    return () => URL.revokeObjectURL(photoPreviewUrl);
  }, [photoPreviewUrl]);

  return (
    <main className="app-shell">
      <section className="builder-panel" aria-label="Birthday card builder">
        <div className="builder-header">
          <p className="eyebrow">Personalized Birthday Card</p>
          <h1>Birthday Card Builder</h1>
        </div>

        <div className="control-stack">
          <section className="control-group" aria-labelledby="recipient-title">
            <div>
              <h2 id="recipient-title">Recipient</h2>
              <p>Name and birthday details for the card.</p>
            </div>
            <div className="field-grid">
              <label>
                Name
                <input
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  placeholder="Maya"
                  maxLength={40}
                  autoComplete="name"
                />
              </label>
              <label>
                Month
                <select
                  value={birthdayMonth}
                  onChange={(event) =>
                    handleBirthdayMonthChange(event.target.value)
                  }
                >
                  {months.map((month, index) => (
                    <option key={month.name} value={index}>
                      {month.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Day
                <select
                  value={birthdayDay}
                  onChange={(event) => setBirthdayDay(Number(event.target.value))}
                >
                  {availableDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="control-group" aria-labelledby="message-title">
            <div>
              <h2 id="message-title">Message</h2>
              <p>Pick a starter wish, then edit it for any card style.</p>
            </div>
            <div className="choice-row" aria-label="Message options">
              {messagePresets.map((message) => (
                <button
                  key={message.id}
                  className="choice-button"
                  type="button"
                  aria-pressed={message.id === selectedMessageId}
                  onClick={() => handleMessagePresetSelect(message)}
                >
                  {message.label}
                </button>
              ))}
            </div>
            <div className="message-edit-fields">
              <label>
                Headline
                <input
                  value={messageHeadline}
                  onChange={(event) => setMessageHeadline(event.target.value)}
                  maxLength={70}
                  placeholder="A birthday note just for you."
                />
              </label>
              <label>
                Message
                <textarea
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  maxLength={180}
                  rows={4}
                  placeholder="Write your birthday wish here..."
                />
              </label>
            </div>
          </section>

          <section className="control-group" aria-labelledby="photo-title">
            <div>
              <h2 id="photo-title">Photo</h2>
              <p>Add a favorite photo to the card.</p>
            </div>
            <div className="photo-actions">
              <label className="upload-button">
                Upload photo
                <input
                  ref={photoInputRef}
                  className="visually-hidden"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
              {photoPreviewUrl && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleRemovePhoto}
                >
                  Remove
                </button>
              )}
            </div>
            {photoFileName && <p className="photo-file-name">{photoFileName}</p>}
          </section>

          <section className="control-group" aria-labelledby="style-title">
            <div>
              <h2 id="style-title">Style</h2>
              <p>Pick the visual direction for the card.</p>
            </div>
            <div className="template-grid" aria-label="Template options">
              {cardTemplates.map((template) => (
                <button
                  key={template.id}
                  className="template-button"
                  type="button"
                  aria-pressed={template.id === selectedTemplateId}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <span
                    className={`template-swatch template-swatch--${template.id}`}
                    aria-hidden="true"
                  />
                  <span>{template.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>

      <aside className="preview-panel" aria-label="Card preview">
        <div className="preview-header">
          <p className="eyebrow">Live Preview</p>
          <span>{selectedTemplate.label} template</span>
        </div>
        <div className={cardPreviewClassName}>
          <div className="party-stickers" aria-hidden="true">
            <span className="sticker sticker--one" />
            <span className="sticker sticker--two" />
            <span className="sticker sticker--three" />
            <span className="sticker sticker--four" />
            <span className="sticker sticker--five" />
          </div>
          <div className="card-graphics" aria-hidden="true">
            <svg
              className="card-graphic card-graphic--cake"
              viewBox="0 0 140 140"
              role="img"
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
              <path
                d="M70 14c10 12-1 18-1 18s-11-7 1-18z"
                fill="#ffcf3f"
              />
              <circle cx="50" cy="92" r="3" fill="#ffffff" />
              <circle cx="69" cy="94" r="3" fill="#ffffff" />
              <circle cx="88" cy="92" r="3" fill="#ffffff" />
            </svg>
            <svg
              className="card-graphic card-graphic--flowers"
              viewBox="0 0 150 150"
              role="img"
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
              className="card-graphic card-graphic--balloons"
              viewBox="0 0 140 160"
              role="img"
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
              className="card-graphic card-graphic--gift"
              viewBox="0 0 140 140"
              role="img"
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
          <div className="card-ribbon">Happy Birthday</div>
          <div
            className={`photo-placeholder ${
              photoPreviewUrl ? "photo-placeholder--filled" : ""
            }`}
          >
            {photoPreviewUrl ? (
              <img src={photoPreviewUrl} alt={`Uploaded photo for ${previewName}`} />
            ) : (
              <span>Photo</span>
            )}
          </div>
          <div className="card-copy">
            <p className="birthday-line">Celebrating {previewBirthday}</p>
            <p>Dear {previewName},</p>
            <h2>{selectedMessage.headline}</h2>
            <p>{selectedMessage.body}</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
