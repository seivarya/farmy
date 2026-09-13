import { useLocation, useNavigate } from "react-router-dom";
import ProcurementForm from "../components/procurement/ProcurementForm";
import LanguageSelector from "../components/common/LanguageSelector";
import { CloseIcon } from "../components/common/Icons";
import "./FormPage.css";

// wrapper for the produce intake form
function FormPage({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/dashboard";
  const handleClose = () => (onClose ? onClose() : navigate(returnTo));

  return (
    <div className="form-page-overlay">
      <div className="form-page-inner">
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <LanguageSelector variant="light" />
          <button type="button" className="form-page-close" onClick={handleClose} aria-label="Close form">
            <CloseIcon size={20} />
          </button>
        </div>
        <ProcurementForm onTicketCreated={() => navigate(returnTo)} />
      </div>
    </div>
  );
}

export default FormPage;
