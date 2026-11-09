import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import "./index.css";
import App from "./App";
import { preloadLoadingAnimation } from "./lib/loadingAnimation";

void preloadLoadingAnimation();
try {
  void DotLottie.preload?.();
} catch {
  /* ignore */
}

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
