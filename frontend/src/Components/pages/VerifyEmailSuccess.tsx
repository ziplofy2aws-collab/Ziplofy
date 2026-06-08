import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../../config/axios";
import "./VerifyEmailSuccess.css";

const VerifyEmailSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`/auth/verify-admin-invite?token=${encodeURIComponent(token)}`);
        setStatus("success");
        setMessage(res.data?.message || "Verification successful. Your account has been activated.");
        setTimeout(() => navigate("/admin/login", { replace: true }), 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "Verification failed. The link may be invalid or expired. Please contact your administrator."
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        <img src="/LOGO.png" alt="Ziplofy" className="verify-email-logo" />
        {status === "loading" && (
          <>
            <div className="verify-email-spinner" />
            <h2>Verifying your email...</h2>
            <p>Please wait while we activate your account.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="verify-email-icon success">✓</div>
            <h2>Verification successful</h2>
            <p>{message}</p>
            <p className="verify-email-redirect">Redirecting to login in a few seconds...</p>
            <button
              type="button"
              className="verify-email-btn"
              onClick={() => navigate("/admin/login", { replace: true })}
            >
              Go to Login
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="verify-email-icon error">✕</div>
            <h2>Verification failed</h2>
            <p>{message}</p>
            <button
              type="button"
              className="verify-email-btn"
              onClick={() => navigate("/admin/login", { replace: true })}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailSuccess;
