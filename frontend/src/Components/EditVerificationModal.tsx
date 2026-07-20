import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "../config/axios";
import "./EditVerificationModal.css";

interface EditVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (otp: string) => void;
  requireVerification: boolean; // false if current user is super-admin
  title?: string;
}

export const EditVerificationModal: React.FC<EditVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  requireVerification,
  title = "Super-Admin Verification Required",
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/auth/request-edit-otp");
      setOtpRequested(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    setError("");
    if (!otp.trim()) {
      setError("Please enter the verification code");
      return;
    }
    if (otp.trim().length !== 6) {
      setError("Code must be 6 digits");
      return;
    }
    onVerified(otp.trim());
    setOtp("");
    setOtpRequested(false);
    onClose();
  };

  const handleClose = () => {
    setOtp("");
    setOtpRequested(false);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="edit-verification-overlay" onClick={handleClose}>
      <div className="edit-verification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-verification-header">
          <h3>{title}</h3>
          <button className="edit-verification-close" onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="edit-verification-body">
          <p className="edit-verification-desc">
            Changes require verification. A 6-digit code will be sent to the super-admin's email.
          </p>
          {!otpRequested ? (
            <button
              className="btn btn-request-otp"
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Code to Super-Admin"}
            </button>
          ) : (
            <>
              <p className="edit-verification-hint">Enter the code received by the super-admin:</p>
              <input
                type="text"
                className="edit-verification-input"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
              <button
                className="btn btn-resend"
                onClick={handleRequestOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Code"}
              </button>
            </>
          )}
          {error && <p className="edit-verification-error">{error}</p>}
        </div>
        <div className="edit-verification-actions">
          <button className="btn btn-cancel" onClick={handleClose}>
            Cancel
          </button>
          {otpRequested && (
            <button className="btn btn-verify" onClick={handleVerify} disabled={otp.length !== 6}>
              Verify & Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
