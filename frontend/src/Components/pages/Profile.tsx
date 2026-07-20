import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Shield, Calendar } from "lucide-react";
import axios from "../../config/axios";
import { useAdminAuth } from "../../contexts/admin-auth.context";
import "./Profile.css";

interface UserDetails {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  roleName?: string;
  superAdmin?: boolean;
  createdAt?: string;
  status?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAdminAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get("/auth/me");
        const raw = res.data?.data || res.data || {};
        // Strip sensitive data - never store tokens, secrets, or internal IDs in profile state
        const safe: UserDetails = {
          name: raw.name ?? raw.email ?? "",
          email: raw.email ?? "",
          role: raw.role ?? raw.roleName ?? "",
          superAdmin: raw.superAdmin ?? false,
        };
        if (raw.createdAt) safe.createdAt = raw.createdAt;
        if (raw.status) safe.status = raw.status;
        setUserDetails(safe);
      } catch (err: unknown) {
        const msg = err && typeof err === "object" && "response" in err && err.response && typeof (err.response as { data?: { message?: string } }).data?.message === "string"
          ? (err.response as { data: { message: string } }).data.message
          : "Failed to load profile";
        setError(msg);
        setUserDetails(authUser ? {
          name: authUser.name,
          email: authUser.email,
          role: authUser.roleName,
        } : null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") {
      if (value && typeof value === "object" && "name" in value) return String((value as { name?: string }).name ?? "—");
      return "—";
    }
    const str = String(value);
    const date = new Date(str);
    if (!isNaN(date.getTime())) return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    return str;
  };

  const accountFields = [
    { key: "name", label: "Name", icon: User },
    { key: "email", label: "Email", icon: Mail },
    { key: "role", label: "Role", icon: Shield },
    { key: "superAdmin", label: "Super Admin", icon: Shield },
    { key: "createdAt", label: "Joined", icon: Calendar },
  ];

  const getDisplayValue = (key: string) => {
    const val = userDetails?.[key as keyof UserDetails];
    if (key === "role" && !val) return userDetails?.roleName ?? "";
    if (val !== undefined && val !== null) return val;
    return null;
  };

  return (
    <div className="profile-page">
      <div className="profile-card-wrapper">
        <div className="profile-card-header">
          <div className="profile-title-block">
            <button className="profile-back-btn" onClick={() => navigate("/admin/dashboard")}>
              <ChevronLeft size={20} />
              Back
            </button>
            <div className="profile-title-accent" />
            <div className="profile-title-text">
              <h1 className="profile-title">Profile</h1>
              <p className="profile-subtitle">View and manage your account details</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="profile-loading">Loading profile...</div>
        ) : error && !userDetails ? (
          <div className="profile-error">{error}</div>
        ) : userDetails ? (
          <div className="profile-content">
            <div className="profile-card profile-card-main">
              <div className="profile-avatar-large">
                {(userDetails.name || userDetails.email || "U").charAt(0).toUpperCase()}
              </div>
              <h2 className="profile-display-name">
                {userDetails.name || "—"}
              </h2>
              <p className="profile-display-email">
                {userDetails.email || "—"}
              </p>
            </div>

            <div className="profile-card">
              <h3 className="profile-section-title">Account Details</h3>
              <div className="profile-details-grid">
                {accountFields.map(({ key, label, icon: Icon }) => {
                  const displayValue = getDisplayValue(key);
                  if (displayValue === null || displayValue === "") return null;
                  return (
                    <div key={key} className="profile-detail-item">
                      <div className="profile-detail-icon">
                        <Icon size={18} />
                      </div>
                      <div>
                        <label>{label}</label>
                        <p>{formatValue(displayValue)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
