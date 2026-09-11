import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
  
const translations = {
  en: {
    farmer: "FARMER REGISTRATION",
    portal: "FARMER PORTAL / REGISTRATION",
    create: "CREATE ACCOUNT",
    subtitle: "Register as a farmer to access the crop procurement portal.",
    fullname: "FULL NAME",
    mobile: "MOBILE NUMBER",
    password: "CREATE PASSWORD",
    confirm: "CONFIRM PASSWORD",
    phName: "Enter your full name",
    phMobile: "Enter mobile number",
    phPass: "Create password",
    phConfirm: "Confirm your password",
    btn: "REGISTER",
    already: "Already have an account?",
    loginHere: "Login here."
  },
  hi: {
    farmer: "किसान पंजीकरण",
    create: "खाता बनाएं",
    portal: "किसान पोर्टल / पंजीकरण",
    subtitle: "फसल खरीद पोर्टल तक पहुंचने के लिए किसान के रूप में पंजीकरण करें।",
    fullname: "पूरा नाम",
    mobile: "मोबाइल नंबर",
    password: "पासवर्ड बनाएं",
    confirm: "पासवर्ड की पुष्टि करें",
    phName: "अपना पूरा नाम दर्ज करें",
    phMobile: "मोबाइल नंबर दर्ज करें",
    phPass: "पासवर्ड बनाएं",
    phConfirm: "पासवर्ड की पुष्टि करें",
    btn: "पंजीकरण करें",
   already: "पहले से ही खाता है?",
    loginHere: "यहां लॉगिन करें।"
  },
  te: {
    farmer: "రైతు నమోదు",
    create: "ఖాతాను సృష్టించండి",
    portal: "రైతు పోర్టల్ / నమోదు",
    subtitle: "పంట సేకరణ పోర్టల్‌ను యాక్సెస్ చేయడానికి రైతుగా నమోదు చేసుకోండి.",
    fullname: "పూర్తి పేరు",
    mobile: "మొబైల్ నంబర్",
    password: "పాస్‌వర్డ్ సృష్టించండి",
    confirm: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    phName: "మీ పూర్తి పేరు నమోదు చేయండి",
    phMobile: "మొబైల్ నంబర్ నమోదు చేయండి",
    phPass: "పాస్‌వర్డ్ సృష్టించండి",
    phConfirm: "పాస్‌వర్డ్ నిర్ధారించండి",
    btn: "నమోదు చేసుకోండి",
    already: "ఇప్పటికే ఖాతా ఉందా?",
    loginHere: "ఇక్కడ లాగిన్ చేయండి."
  },
  es: {
    farmer: "REGISTRO DE AGRICULTORES",
    create: "CREAR CUENTA",
    portal: "PORTAL DEL AGRICULTOR / REGISTRO",
    subtitle: "Regístrese como agricultor para acceder al portal.",
    fullname: "NOMBRE COMPLETO",
    mobile: "NÚMERO DE MÓVIL",
    password: "CREAR CONTRASEÑA",
    confirm: "CONFIRMAR CONTRASEÑA",
    phName: "Ingrese su nombre completo",
    phMobile: "Ingrese número móvil",
    phPass: "Ingrese contraseña",
    phConfirm: "Confirmar contraseña",
    btn: "REGISTRAR",    already: "¿Ya tienes una cuenta?",
    loginHere: "Inicia sesión aquí.",
    otpSuccess: "OTP verified"

  } };
  function App() {
  const [lang, setLang] = useState('en');
  const t = (key) => translations[lang][key] || key;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (!otpSent || countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleRegister = (e) => {
    e.preventDefault();

    if (phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
      setPhoneError("Mobile number must contain exactly 10 digits.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match. Please enter the same password in both fields.");
      setPhoneError("");
      return;
    }

    setPasswordError("");
    setPhoneError("");
    setOtpSent(true);
    setOtp("");
    setOtpVerified(false);
    setOtpError("");
    setCountdown(60);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();

    if (otp === "1234") {
      setOtpVerified(true);
      setOtpError("");
      return;
    }

    setOtpError("Invalid OTP. Please enter the correct code.");
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setOtp("");
    setOtpError("");
    setCountdown(60);
  };

 return (
  <div className="page">
    <div style={{position:'absolute', top:10, right:10, zIndex:999}}>
      <select value={lang} onChange={(e) => setLang(e.target.value)} style={{padding:"5px"}}>
  <option value="en">English</option>
  <option value="hi">Hindi</option>
  <option value="te">Telugu</option>
  <option value="es">Spanish</option>
</select>
    </div>

      <section className="left-panel">
        <div className="brand">
          <div className="brand-icon">🌱</div>
          <span>AGRICULTURE</span>
        </div>

        <div className="left-content">
          <p className="eyebrow">GROW • HARVEST • PROSPER</p>

          <h1>
            FARMER
            <br />
            REGISTRATION
          </h1>

          <div className="gold-line"></div>

          <div className="image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=85"
              alt="Farmer working in agricultural field"
            />
          </div>

          <div className="left-info-stack">
            <div className="left-info-card feature-card accent-card">
              <span className="info-badge">SMART PROCUREMENT</span>
              <h4>Efficient crop buying made transparent.</h4>
              <p>
                Farmers can book slots, check queue status, and track
                procurement steps without long delays or uncertainty.
              </p>
            </div>

            <div className="portal-label">
              <span className="info-badge">SUPPORT</span>
              <h4>Guidance at every stage.</h4>
              <p>
                Clear updates and support channels help farmers move through
                registration, verification, and dispatch with ease.
              </p>
            </div>

            <div className="left-info-card feature-card">
              <span className="info-badge">ACCESSIBILITY</span>
              <h4>Simple and farmer-friendly operations.</h4>
              <p>
                Designed to reduce congestion, simplify scheduling, and make
                procurement processes smoother for rural communities.
              </p>
            </div>
          </div>
        </div>

        <p className="ministry">
          MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION, INDIA
        </p>
      </section>

      {/* RIGHT PANEL */}
      <section className="right-panel">
        <div className="form-container">

          <div className="portal-label">
            FARMER PORTAL / REGISTRATION
          </div>

          <div className="portal-icon">🌾</div>

          <h2>
 {translations[lang].create}
</h2>

          
          <form onSubmit={otpVerified ? undefined : handleRegister}>
            
              <p className="subtitle">
 {translations[lang].subtitle}
</p>
              
                <div className="input-group">
                  <label>{translations[lang].fullname}</label>

                  <div className="input-wrapper">
                    <span className="input-icon">♙</span>
                    <input
                      type="text"
                      placeholder={translations[lang].phName}
                      required
                    />
                  </div>
                </div>

                {/* MOBILE */}
                <div className="input-group">
                 <label>{translations[lang].mobile}</label>

                  <div className="input-wrapper">
                  
                    <span className="input-icon">☎</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                     placeholder={translations[lang].phMobile}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      required
                    />
                  </div>
                </div>
                </form>

                {/* PASSWORD */}
                <div className="input-group">
                  <label>{translations[lang].password}</label>

                  <div className="input-wrapper">
                    <span className="input-icon">♙</span>

                    <input
  type={showPassword? "text" : "password"}
  placeholder={translations[lang].phPass}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
/>

                    <button
                      type="button"
                      className="eye-button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "◉" : "◌"}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="input-group">
                  <label>{translations[lang].confirm}*</label>

                  <div className="input-wrapper">
                    <span className="input-icon">♙</span>

                    <input
  type={showPassword? "text" : "password"}
  placeholder={translations[lang].phConfirm}
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  required
/>

                    <button
                      type="button"
                      className="eye-button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "◉" : "◌"}
                    </button>
                  </div>
                </div>

                {passwordError ? (
                  <p className="password-error">{passwordError}</p>
                ) : null}

                {phoneError ? <p className="password-error">{phoneError}</p> : null}

<button type="submit" className="register-button">
  {translations[lang].btn}
</button>
            {otpSent && !otpVerified ? (
              <div className="otp-box">
                <div className="otp-header">
                  <span className="otp-tag">OTP VERIFICATION</span>
                  <span className="otp-timer">
                    {countdown > 0 ? `00:${String(countdown).padStart(2, "0")}` : "00:00"}
                  </span>
                </div>

                <p className="otp-message">
                  Enter the 4-digit OTP sent to your mobile number.
                </p>

                <div className="input-group otp-group">
                  <label>ENTER OTP*</label>

                  <div className="input-wrapper">
                    <span className="input-icon">✦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>

                {otpError ? <p className="otp-error">{otpError}</p> : null}

                <button type="button" className="verify-button" onClick={handleOtpSubmit}>
                  VERIFY OTP
                </button>

                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? "Resend OTP in 1 minute" : "Resend OTP"}
                </button>
              </div>
            ) : null}
          {otpVerified && (
            <div className="otp-success-box">
              <span className="otp-success-icon">✓</span>
              <p>OTP verified successfully. Your registration is complete. Kindly login.</p>
            </div>
        )}
      
            
  
          <p className="login-text">
            Already have an account?
            <Link to="/login"> Login here.</Link>
          </p>

          <div className="decorative-leaves top-leaves">
            <span>·</span>
            <span>◒</span>
            <span>🌿</span>
            <span>◓</span>
            <span>·</span>
          </div>
 


          <div className="website-description">
            <p className="desc-label">OUR MISSION</p>
            <h3>Smarter procurement for every farmer.</h3>
            <p>
              Farmers often face long waiting times, lack of information
              regarding procurement schedules, and uncertainty about
              procurement status. Our platform addresses these challenges by
              enabling farmer registration, slot booking, real-time queue
              management, instant SMS and app notifications, and transparent
              tracking of procurement and payment updates.
            </p>
            <ul>
              <li>Farmer registration and slot booking</li>
              <li>Real-time queue management</li>
              <li>SMS and app notifications</li>
              <li>Procurement and payment status tracking</li>
              <li>Reduced congestion at procurement centres</li>
            </ul>
          </div>

          <div className="decorative-leaves bottom-leaves">
            <span>·</span>
            <span>◒</span>
            <span>🌿</span>
            <span>◓</span>
            <span>·</span>
          </div>

        </div>
      </section>
    </div>
  );
}

export default App;