import { Icon } from "./Icon";
import { useApp } from "../store/AppStore";

export function Toasts() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          <span className="toast__icon" aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
