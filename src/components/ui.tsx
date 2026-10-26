import { useEffect, type ReactNode } from "react";
import { Icon } from "./Icon";

/* — Titre de page (kit : titre Manrope 28 + sous-titre + bouton principal) — */

export function PageHead({
  title,
  subtitle,
  action,
  textWidth,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  /** Largeur du bloc de texte, reprise de la boîte de texte Figma. */
  textWidth?: number;
}) {
  return (
    <div className="page-head">
      <div style={textWidth ? { maxWidth: textWidth } : undefined}>
        <h1 className="page-head__title">{title}</h1>
        <p className="page-head__subtitle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/* — Onglets (kit « Navigation / Onglets ») — */

export type TabItem = { id: string; label: string; count?: number };

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          className={`tab${item.id === value ? " is-active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.count === undefined ? item.label : `${item.label} (${item.count})`}
        </button>
      ))}
    </div>
  );
}

/* — Champ de recherche (kit « Champ / Recherche ») — */

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="field-search">
      <span className="visually-hidden">{label}</span>
      <Icon name="search" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/* — Champ de sélection (kit « Champ / Sélection ») — */

export function SelectField({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div className="field-select">
      <span className="visually-hidden" id={`label-${label}`}>
        {label}
      </span>
      <select
        aria-labelledby={`label-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="chev" aria-hidden="true">
        <Icon name="chevronDown" />
      </span>
    </div>
  );
}

/* — Fenêtres (non maquettées : la création et le détail les rendent nécessaires) — */

function useEscape(onClose: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEscape(onClose);
  return (
    <div
      className="overlay overlay--center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__head">
          <div>
            <h2 className="modal__title">{title}</h2>
            {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Fermer"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__foot">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Drawer({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEscape(onClose);
  return (
    <div
      className="overlay overlay--right"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer__head">
          <div>
            <h2 className="modal__title">{title}</h2>
            {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Fermer"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer ? <div className="drawer__foot">{footer}</div> : null}
      </div>
    </div>
  );
}

/* — Champ de formulaire — */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      {children}
      {error ? (
        <p className="form-field__error">{error}</p>
      ) : hint ? (
        <p className="form-field__hint">{hint}</p>
      ) : null}
    </div>
  );
}
