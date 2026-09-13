import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useSlotBooking } from "../hooks/useSlotBooking";
import BookingList from "../components/slots/BookingList";
import SlotBookingPanel from "../components/slots/SlotBookingPanel";
import SlotPageHeader from "../components/slots/SlotPageHeader";
import SlotStats from "../components/slots/SlotStats";
import { AlertCircleIcon, CheckCircleIcon } from "../components/common/Icons";
import "./Dashboard.css";

function DashboardPage() {
  const navigate = useNavigate();
  const { farmer, logout } = useAuth();
  const booking = useSlotBooking();
  const identityStatusLabel = useMemo(
    () =>
      ({
        self_declared: "Identity recorded",
        officially_reviewed: "Identity reviewed",
        verified: "Identity verified",
      }[farmer?.identityVerificationStatus] || "Identity recorded"),
    [farmer?.identityVerificationStatus],
  );
  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);
  const createTicket = useCallback(
    () => navigate("/form", { state: { returnTo: "/slots" } }),
    [navigate],
  );

  return (
    <div className="dashboard-container">
      <SlotPageHeader farmer={farmer} onLogout={handleLogout} />
      <main className="dashboard-content">
        <SlotStats
          activeBookingsCount={booking.activeBookingsCount}
          bookingCount={booking.history.bookings.length}
          identityStatusLabel={identityStatusLabel}
        />
        {booking.feedback.message && (
          <div
            className={`dashboard-alert ${booking.feedback.type === "error" ? "alert-error" : "alert-success"}`}
            role="alert"
          >
            {booking.feedback.type === "error" ? <AlertCircleIcon size={18} /> : <CheckCircleIcon size={18} />}
            <p>{booking.feedback.message}</p>
          </div>
        )}
        <div className="dashboard-layout-grid">
          <SlotBookingPanel booking={booking.form} onCreateTicket={createTicket} />
          <BookingList {...booking.history} />
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
