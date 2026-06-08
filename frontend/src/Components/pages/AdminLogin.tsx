import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/admin-auth.context";
import "./AdminLogin.css";

const AdminLogin: React.FC = () => {
  const { login, verifyOtp, loading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [awaitingOtp, setAwaitingOtp] = useState<{ email: string } | null>(null);
  const [resendSeconds, setResendSeconds] = useState<number>(60);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login(email, password);
      if (res && (res as any).twoFactorRequired) {
        setAwaitingOtp({ email: (res as any).email || email });
        setResendSeconds(60);
        const interval = setInterval(() => {
          setResendSeconds((s) => {
            if (s <= 1) {
              clearInterval(interval);
              return 0;
            }
            return s - 1;
          });
          return () => clearInterval(interval);
        }, 1000);
        return; // proceed to OTP step
      }
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await verifyOtp(awaitingOtp?.email || email, otp);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Wrong code, please retype the correct code");
    }
  };

  const handleResend = async () => {
    if (!awaitingOtp?.email || resendSeconds > 0) return;
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'}/auth/admin/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: awaitingOtp.email })
      });
      setResendSeconds(60);
      const interval = setInterval(() => {
        setResendSeconds((s) => {
          if (s <= 1) {
            clearInterval(interval);
            return 0;
          }
          return s - 1;
        });
        return () => clearInterval(interval);
      }, 1000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Unable to resend code, try again later');
    }
  };

  return (
    <div className="admin-login">
      {!awaitingOtp ? (
        <form className="admin-login-card" onSubmit={handleSubmit}>
          <img src="/LOGO.png" alt="Logo" className="admin-login-logo" />
          <h2>Admin Login</h2>
          {error && <div className="error">{error}</div>}
          <label htmlFor="admin-login-email">Email</label>
          <input id="admin-login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="admin-login-password">Password</label>
          <div className="password-field">
            <input id="admin-login-password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="toggle" type="button" onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"}</button>
          </div>
          <button className="submit" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
          <p className="hint">Use your admin credentials to continue.</p>
        </form>
      ) : (
        <form className="admin-login-card" onSubmit={handleVerifyOtp}>
          <img src="/LOGO.png" alt="Logo" className="admin-login-logo" />
          <h2>Enter Verification Code</h2>
          {error && <div className="error">{error}</div>}
          <p>We sent a 6-digit code to <strong>{awaitingOtp.email}</strong>. Enter it below.</p>
          <label>Verification Code</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter 6-digit code" maxLength={6} required />
          <button className="submit" type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify Code"}</button>
          <div style={{ marginTop: 10 }}>
            <button className="submit" type="button" onClick={handleResend} disabled={resendSeconds > 0}>
              {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}
            </button>
          </div>
          <p className="hint">Didn’t receive the code? Check spam or request again.</p>
        </form>
      )}
    </div>
  );
};

export default AdminLogin;


