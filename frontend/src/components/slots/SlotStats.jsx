import { memo } from "react";
import { CalendarIcon, FileTextIcon, ShieldCheckIcon } from "../common/Icons";

function SlotStats({ activeBookingsCount, bookingCount, identityStatusLabel }) {
  return <section className="stats-grid"><div className="stat-card accent"><span className="stat-icon"><CalendarIcon size={22} /></span><div className="stat-info"><h3>Active Bookings</h3><p className="stat-number">{activeBookingsCount}</p></div></div><div className="stat-card"><span className="stat-icon"><FileTextIcon size={22} /></span><div className="stat-info"><h3>Total History</h3><p className="stat-number">{bookingCount}</p></div></div><div className="stat-card"><span className="stat-icon"><ShieldCheckIcon size={22} /></span><div className="stat-info"><h3>Farmer Status</h3><p className="stat-status">{identityStatusLabel}</p></div></div></section>;
}

export default memo(SlotStats);
