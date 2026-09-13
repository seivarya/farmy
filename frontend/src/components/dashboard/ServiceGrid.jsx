import { memo } from "react";
import ServiceCard from "./ServiceCard";

function ServiceGrid({ services, onSelect }) {
  return (
    <section className="feature-grid">
      {services.map((service) => (
        <ServiceCard key={service.number} service={service} onSelect={onSelect} />
      ))}
    </section>
  );
}

export default memo(ServiceGrid);
