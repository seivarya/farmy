import { memo } from "react";
import BrandLogo from "../common/BrandLogo";
import { LogOutIcon, UserIcon } from "../common/Icons";
import LanguageSelector from "../common/LanguageSelector";

function SlotPageHeader({ farmer, onLogout }) {
  return (
    <header className="dashboard-navbar">
      <div className="navbar-brand">
        <BrandLogo />
        <span className="navbar-tag">PROCUREMENT PORTAL</span>
      </div>
      <div className="navbar-user-actions">
        <LanguageSelector variant="dark" />
        <div className="farmer-badge">
          <span className="farmer-avatar">
            <UserIcon size={16} />
          </span>
          <div className="farmer-meta">
            <span className="farmer-name">{farmer?.fullname || "Farmer"}</span>
            <span className="farmer-phone">+91 {farmer?.mobileNumber}</span>
          </div>
        </div>
        <button type="button" className="logout-button" onClick={onLogout}>
          <span>Logout</span>
          <LogOutIcon size={14} />
        </button>
      </div>
    </header>
  );
}

export default memo(SlotPageHeader);

