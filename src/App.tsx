export default function App() {
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
                <input placeholder="Maya" disabled />
              </label>
              <label>
                Birthday
                <input type="date" disabled />
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
            <p>Dear Maya,</p>
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
