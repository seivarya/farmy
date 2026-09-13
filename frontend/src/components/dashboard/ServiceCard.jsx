import { memo } from "react";
import { ArrowRightIcon } from "../common/Icons";

function ServiceCard({ service, onSelect }) {
  const Icon = service.icon;
  const isAvailable = Boolean(service.destination);

  return (
    <article
      className={`service-card ${isAvailable ? "clickable" : ""}`}
      onClick={() => isAvailable && onSelect(service.destination)}
    >
      {service.badge && <span className="demand-badge">{service.badge}</span>}
      <div className={`service-icon ${service.iconClass}`}>
        <Icon size={22} />
      </div>
      <span className="service-number">{service.number}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <div className="card-divider" />
      <button
        type="button"
        className="service-action"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(service.destination);
        }}
        disabled={!isAvailable}
      >
        {service.action}
        {isAvailable && <ArrowRightIcon size={14} />}
      </button>
    </article>
  );
}

export default memo(ServiceCard);
