import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CardExperience from "../components/CardExperience";
import { fetchCardById, type SharedCardPayload } from "../lib/cardLink";

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "loaded"; payload: SharedCardPayload };

export default function ShortCardPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!id) {
      setState({ status: "not-found" });
      return;
    }

    let isCancelled = false;

    fetchCardById(id).then((payload) => {
      if (isCancelled) {
        return;
      }

      setState(payload ? { status: "loaded", payload } : { status: "not-found" });
    });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (state.status === "loaded") {
    return <CardExperience sharedCard={state.payload} />;
  }

  return (
    <main className="app-shell">
      <aside className="preview-panel" aria-label="Card preview">
        <div className="card-status-message">
          <span
            className={`card-status-envelope ${
              state.status === "not-found" ? "card-status-envelope--faded" : ""
            }`}
            aria-hidden="true"
          />
          <p>
            {state.status === "loading"
              ? "Getting your card ready..."
              : "This card link isn't available anymore."}
          </p>
        </div>
      </aside>
    </main>
  );
}
