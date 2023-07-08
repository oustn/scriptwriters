import React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app.js";
import "./main.scss";
import { CssBaseline } from "@mui/material";

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
  doc.style.setProperty("--content-height", `${window.innerHeight - 56 - 56}px`);
};
window.addEventListener("resize", appHeight);
appHeight();

function Wrapper({ children }: { children?: React.ReactNode }) {
  return (
    <React.Fragment>
      <CssBaseline />
      {children}
    </React.Fragment>
  );
}

// Render your React component instead
const root = createRoot(document.getElementById("app")!);
root.render(
  <Wrapper>
    <App />
  </Wrapper>
);
