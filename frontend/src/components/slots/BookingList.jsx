import { memo } from "react";
import { WheatIcon } from "../common/Icons";

function BookingList({ bookings, isLoading, onCancel }) {
  return <section className="dashboard-card bookings-list-panel"><div className="panel-header"><h2>My Scheduled Slots</h2><p>Track your arrivals and procurement center status.</p></div>{isLoading ? <p className="loading-note">Loading your bookings...</p> : bookings.length === 0 ? <div className="empty-bookings"><span className="empty-icon"><WheatIcon size={40} /></span><h4>No slots booked yet</h4><p>Pick a date on the left to schedule your crop procurement delivery.</p></div> : <div className="bookings-stack">{bookings.map((booking) => <div key={booking._id} className={`booking-item-card status-${booking.status}`}><div className="booking-top-line"><span className={`status-pill pill-${booking.status}`}>{booking.status.toUpperCase()}</span><span className="booking-date">{booking.date}</span></div><div className="booking-details"><div className="detail-item"><span className="detail-label">TIME SLOT</span><span className="detail-value">{booking.timeSlot}</span></div><div className="detail-item"><span className="detail-label">CROP / QUANTITY</span><span className="detail-value">{booking.cropType || "Wheat"} ({booking.quantityQuintals || 20} Quintals)</span></div></div>{booking.status === "booked" && <div className="booking-actions"><button type="button" className="cancel-slot-button" onClick={() => onCancel(booking._id)}>Cancel Booking</button></div>}</div>)}</div>}</section>;
}

export default memo(BookingList);
