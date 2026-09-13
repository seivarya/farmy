import { useState } from "react";
import { LogOutIcon, SproutIcon, UserIcon } from "../common/Icons";
import NotificationMenu from "../notifications/NotificationMenu";
import LanguageSelector from "../common/LanguageSelector";

export default function DashboardHeader({ farmer, onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileName = farmer?.fullname || "Farmer";
  const profilePhone = farmer?.mobileNumber ? `+91 ${farmer.mobileNumber}` : "Registered Farmer";

  return (
    <header className="landing-header">
      <div className="header-brand"><div className="header-logo"><SproutIcon size={22} /></div><div><div className="ministry-name">MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION, INDIA</div><div className="portal-name">Crop Procurement Portal</div></div></div>
      <div className="header-actions">
        <div className="procurement-status"><span className="status-dot" />Procurement Active (Kharif 2026-27)</div>
        <LanguageSelector variant="dark" />
        <div className="farmer-profile-wrap">
          <button type="button" className="farmer-profile" onClick={() => setIsProfileOpen((open) => !open)} aria-expanded={isProfileOpen} aria-label={`Open ${profileName}'s profile`}><div className="farmer-avatar"><UserIcon size={16} /></div><div><strong>{profileName}</strong><span>{profilePhone}</span></div></button>
          {isProfileOpen && <div className="profile-menu"><strong>{profileName}</strong><span>Farmer account</span><small>{profilePhone}</small></div>}
        </div>
        <NotificationMenu />
        <button type="button" onClick={onLogout} className="logout-button"><LogOutIcon size={14} />LOGOUT</button>
      </div>
    </header>
  );
}

