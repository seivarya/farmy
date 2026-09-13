import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { SproutIcon } from "../components/common/Icons";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ServiceGrid from "../components/dashboard/ServiceGrid";
import Loading from "../components/common/Loading";
import { dashboardServices } from "../data/dashboardServices";
import "./LandingPage.css";

const CropDemandPage = lazy(() => import("./CropDemandPage"));
const SchedulePage = lazy(() => import("./SchedulePage"));
const FormPage = lazy(() => import("./FormPage"));

function LandingPage() {
  const navigate = useNavigate();
  const { farmer, logout } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showDemand, setShowDemand] = useState(false);

  const handleServiceSelect = useCallback((destination) => {
    if (destination === "schedule") setShowSchedule(true);
    if (destination === "demand") setShowDemand(true);
    if (destination === "slots") navigate("/slots");
    if (destination === "tickets") navigate("/tickets");
  }, [navigate]);

  const openScheduleFromDemand = useCallback(() => { setShowDemand(false); setShowSchedule(true); }, []);
  const openFormFromDemand = useCallback(() => { setShowDemand(false); setShowForm(true); }, []);
  const bookSlotFromDemand = useCallback(() => { setShowDemand(false); navigate("/slots"); }, [navigate]);

  return (
    <div className="landing-page">
      <DashboardHeader farmer={farmer} onLogout={logout} />

      {/* main content */}
      <main className="landing-main">
        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="official-badge">OFFICIAL FARMER DESK</span>
            <h1>Farmer Procurement Dashboard</h1>
            <p>
              Welcome to the integrated procurement & MSP payment portal.
              Select any module below to schedule slots, track weighbridge
              tokens, or manage your procurement payments.
            </p>
          </div>

          <div className="welcome-decoration">
            <SproutIcon size={40} />
          </div>
        </section>

        <div className="services-heading">
          <h2>Select Procurement Service</h2>
          <span className="service-count">6 SERVICES AVAILABLE</span>
        </div>

        <ServiceGrid services={dashboardServices} onSelect={handleServiceSelect} />
      </main>

      <Suspense fallback={<Loading />}>
        {showForm && <FormPage onClose={() => setShowForm(false)} />}
        {showSchedule && <SchedulePage onClose={() => setShowSchedule(false)} />}
        {showDemand && <CropDemandPage onClose={() => setShowDemand(false)} onOpenSchedule={openScheduleFromDemand} onOpenForm={openFormFromDemand} onBookSlot={bookSlotFromDemand} />}
      </Suspense>
    </div>
  );
}

export default LandingPage;
