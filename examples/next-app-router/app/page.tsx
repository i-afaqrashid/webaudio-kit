import { AudioControls } from "./audio-controls";

export default function Page() {
  return (
    <main className="shell">
      <span className="kicker">Next App Router</span>
      <h1>Keep Web Audio in a client component.</h1>
      <p>
        The page is a server component. The provider, hooks, buttons, and canvas
        visualizers live inside the client component below.
      </p>
      <AudioControls />
    </main>
  );
}
