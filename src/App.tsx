import { useState } from "react";

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
  const [customHeadline, setCustomHeadline] = useState(
    "A birthday note just for you.",
  );
  const [customMessage, setCustomMessage] = useState(
    "Hope your birthday is full of little surprises, big smiles, and everything that makes you feel celebrated.",
  );
  const previewName = recipientName.trim() || "Birthday Star";
  const isCustomMessage = selectedMessageId === "custom";
  const selectedPreset =
    messagePresets.find((message) => message.id === selectedMessageId) ??
    messagePresets[0];
  const selectedMessage = isCustomMessage
    ? {
        headline:
          customHeadline.trim() || "Add your own birthday card headline.",
        body:
          customMessage.trim() ||
          "Write your own birthday message to see it here.",
      }
    : selectedPreset;
  const availableDays = Array.from(
    { length: months[birthdayMonth].days },
    (_, index) => index + 1,
  );
  const previewBirthday = formatBirthdayDate(birthdayMonth, birthdayDay);

  function handleBirthdayMonthChange(value: string) {
    const nextMonth = Number(value);
    const maxDay = months[nextMonth].days;

    setBirthdayMonth(nextMonth);
    setBirthdayDay((currentDay) => Math.min(currentDay, maxDay));
  }

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
              <p>Choose a wish or write a personal note.</p>
            </div>
            <div className="choice-row" aria-label="Message options">
              {messagePresets.map((message) => (
                <button
                  key={message.id}
                  className="choice-button"
                  type="button"
                  aria-pressed={message.id === selectedMessageId}
                  onClick={() => setSelectedMessageId(message.id)}
                >
                  {message.label}
                </button>
              ))}
              <button
                className="choice-button"
                type="button"
                aria-pressed={isCustomMessage}
                onClick={() => setSelectedMessageId("custom")}
              >
                Custom
              </button>
            </div>
            {isCustomMessage && (
              <div className="custom-message-fields">
                <label>
                  Custom headline
                  <input
                    value={customHeadline}
                    onChange={(event) => setCustomHeadline(event.target.value)}
                    maxLength={70}
                    placeholder="A birthday note just for you."
                  />
                </label>
                <label>
                  Your message
                  <textarea
                    value={customMessage}
                    onChange={(event) => setCustomMessage(event.target.value)}
                    maxLength={180}
                    rows={4}
                    placeholder="Write your birthday wish here..."
                  />
                </label>
              </div>
            )}
          </section>

          <section className="control-group" aria-labelledby="style-title">
            <div>
              <h2 id="style-title">Style</h2>
              <p>Pick the visual direction for the card.</p>
            </div>
            <div className="template-grid" aria-label="Template options">
              <span>Elegant</span>
              <span>Playful</span>
              <span>Bold</span>
              <span>Photo</span>
            </div>
          </section>
        </div>
      </section>

      <aside className="preview-panel" aria-label="Card preview">
        <div className="preview-header">
          <p className="eyebrow">Live Preview</p>
          <span>Digital card</span>
        </div>
        <div className="card-preview">
          <div className="card-ribbon">Happy Birthday</div>
          <div className="photo-placeholder" aria-hidden="true" />
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
