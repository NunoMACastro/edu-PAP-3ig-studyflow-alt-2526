/**
 * Documenta a responsabilidade de main dentro de real_dev.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./styles.css";

/**
 * Monta a aplicação React.
 */
createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
