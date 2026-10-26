import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

/**
 * « ?reset » remet la démonstration à zéro avant le premier rendu : pratique
 * pour enchaîner plusieurs personnes lors d'un test utilisateur, sans passer
 * par la console du navigateur.
 */
if (window.location.search.includes("reset")) {
  try {
    window.localStorage.removeItem("campus.state.v3");
  } catch {
    /* stockage indisponible : l'application repart du jeu de démonstration */
  }
  window.history.replaceState({}, "", window.location.pathname);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
