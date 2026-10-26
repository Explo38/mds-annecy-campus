import { Drawer } from "./ui";
import { Icon } from "./Icon";
import { useApp } from "../store/AppStore";
import { isSameDay, longDate, period, slot } from "../lib/format";

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { state, resourceById, removeFromCart, clearCart, submitCart, setCartQuantity } =
    useApp();
  const items = state.cart;
  const exemplaires = items.reduce((n, i) => n + i.quantity, 0);

  const submit = () => {
    submitCart();
    onClose();
  };

  return (
    <Drawer
      title="Mon panier"
      subtitle={
        items.length
          ? `${exemplaires} exemplaire${exemplaires > 1 ? "s" : ""} sur ${items.length} référence${items.length > 1 ? "s" : ""}`
          : "Aucune ressource sélectionnée"
      }
      onClose={onClose}
      footer={
        items.length ? (
          <>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={clearCart}
            >
              Vider
            </button>
            <button type="button" className="btn btn--primary" onClick={submit}>
              <Icon name="check" />
              Envoyer {exemplaires > 1 ? `${exemplaires} demandes` : "la demande"}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Fermer
          </button>
        )
      }
    >
      {items.length === 0 ? (
        <p className="list-empty" style={{ padding: "32px 0" }}>
          Votre panier est vide. Parcourez le catalogue pour y ajouter du matériel
          ou un espace.
        </p>
      ) : (
        <ul>
          {items.map((item) => {
            const resource = resourceById(item.resourceId);
            if (!resource) return null;
            return (
              <li key={item.resourceId} className="cart-line">
                <span className="cart-line__icon" aria-hidden="true">
                  <Icon name={resource.icon} />
                </span>
                <div className="cart-line__body">
                  <p className="cell-primary">{resource.name}</p>
                  <p className="cell-secondary">
                    {/* Un créneau tient dans la journée ; un prêt court sur
                        plusieurs jours et se lit comme une période. */}
                    {isSameDay(item.start, item.end)
                      ? `${longDate(item.start)} · ${slot(item.start, item.end)}`
                      : period(item.start, item.end)}
                  </p>
                  <p className="cell-secondary">
                    {resource.workflow} · {resource.access}
                  </p>
                  {item.quantity > 1 || resource.total > 1 ? (
                    <div className="stepper stepper--sm" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="stepper__btn"
                        onClick={() =>
                          setCartQuantity(item.resourceId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label={`Retirer un ${resource.name}`}
                      >
                        −
                      </button>
                      <span className="stepper__value">{item.quantity}</span>
                      <button
                        type="button"
                        className="stepper__btn"
                        onClick={() =>
                          setCartQuantity(item.resourceId, item.quantity + 1)
                        }
                        aria-label={`Ajouter un ${resource.name}`}
                      >
                        +
                      </button>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="cart-line__remove"
                  onClick={() => removeFromCart(item.resourceId)}
                  aria-label={`Retirer ${resource.name} du panier`}
                >
                  <Icon name="close" size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
