import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AudioProvider } from "@webaudio-kit/react";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </StrictMode>,
);
