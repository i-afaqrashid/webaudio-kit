import { AudioControls } from "./audio-controls";

export default function Page() {
  return (
    <main>
      <h1>webaudio-kit Next example</h1>
      <p>
        Provider and Web Audio hooks stay inside the client component below.
      </p>
      <AudioControls />
    </main>
  );
}
