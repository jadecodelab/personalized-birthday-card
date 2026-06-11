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
  const previewName = recipientName.trim() || "Birthday Star";
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
              <span>Warm</span>
              <span>Funny</span>
              <span>Custom</span>
            </div>
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
            <h2>Wishing you a day full of joy.</h2>
            <p>
              May this year bring bright moments, good people, and the kind of
              memories you keep smiling about.
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}
