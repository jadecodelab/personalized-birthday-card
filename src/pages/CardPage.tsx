import CardExperience from "../components/CardExperience";
import { decodeCardLink } from "../lib/cardLink";

export default function CardPage() {
  // The card payload lives in the URL fragment (#d=...), not the query
  // string, so it never gets sent to the server.
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const encoded = hashParams.get("d");
  const sharedCard = encoded ? decodeCardLink(encoded) : null;

  return <CardExperience sharedCard={sharedCard} />;
}
