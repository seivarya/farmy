import { useNavigate } from "react-router-dom";
import { CloseIcon } from "../components/common/Icons";
import LanguageSelector from "../components/common/LanguageSelector";
import MspTable from "../components/schedule/MspTable";
import "./SchedulePage.css";

// modal overlay for the msp matrix
function SchedulePage({ onClose }) {
  const navigate = useNavigate();
  const handleClose = () => (onClose ? onClose() : navigate("/dashboard"));

  return (
    <div
      className="schedule-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-title"
    >
      <section className="schedule-modal">
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <LanguageSelector variant="light" />
          <button
            className="schedule-close"
            onClick={handleClose}
            aria-label="Close schedule"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <MspTable />
      </section>
    </div>
  );
}

export default SchedulePage;
