import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCog, FaMoon, FaSun, FaUser, FaSignOutAlt } from "react-icons/fa";
import { X } from "lucide-react";
import "./Navbar.css";
import Sidebar from "./Sidebar";
import { useAdminAuth } from "../contexts/admin-auth.context";
import { useTheme } from "../contexts/theme.context";
import ClientList from "./pages/ClientList";
import ClientDetail from "./pages/ClientDetail";
import ClientStores from "./pages/ClientStores";
import ClientAnalytics from "./pages/ClientAnalytics";
import DevAdmin from "./pages/DevAdmin";
import DevRequests from "./pages/DevRequests";
import Domain from "./pages/Domain";
import Invoice from "./pages/Invoice";
import LiveSupport from "./pages/LiveSupport";
import ManageUser from "./pages/ManageUser";
import MembershipPlan from "./pages/MembershipPlan";
import Payment from "./pages/Payment";
import RaiseTask from "./pages/RaiseTask";
import RolesPermission from "./pages/RolesPermission";
import SupportDeveloper from "./pages/SupportDeveloper";
import ThemeDeveloper from "./pages/ThemeDeveloper";
import ThemeEditPage from "./pages/ThemeEditPage";
import Ticket from "./pages/Ticket";
import Profile from "./pages/Profile";
import ActivityLogs from "./pages/ActivityLogs";

type MenuItem =
  | "Client List"
  | "Payment"
  | "Invoice"
  | "Manage User"
  | "Roles & Permission"
  | "Domain"
  | "Ticket"
  | "Raise Task"
  | "Live Support"
  | "Membership Plan"
  | "Dev Admin"
  | "Theme Developer"
  | "Support Developer"
  | "Hire Developer Requests"
  | "Activity Logs"
  | "Dashboard";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState<MenuItem>(() => {
    const saved = sessionStorage.getItem("activeMenu") as MenuItem;
    return saved || "Client List";
  });
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("app-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          emailNotifications: parsed.emailNotifications ?? true,
          pushNotifications: parsed.pushNotifications ?? false,
          weeklyDigest: parsed.weeklyDigest ?? false,
        };
      }
    } catch {}
    return { emailNotifications: true, pushNotifications: false, weeklyDigest: false };
  });

  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
  }, [settings]);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const isSuperAdmin = user?.roleName === "super-admin" || (typeof window !== "undefined" && localStorage.getItem("isSuperAdmin") === "true");

  useEffect(() => {
    if (user && activeMenu === "Client List" && !isSuperAdmin) {
      setActiveMenu("Payment");
      sessionStorage.setItem("activeMenu", "Payment");
    }
  }, [user, activeMenu, isSuperAdmin]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleSelect = (item: string) => {
    const menuItem = item as MenuItem;
    setActiveMenu(menuItem);
    sessionStorage.setItem("activeMenu", menuItem);
    // When on client detail or analytics, navigate away so the selected menu content shows
    const isOnClientPage = location.pathname.match(/\/admin\/client\/[^/]+(\/analytics)?/);
    if (isOnClientPage) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <>
      <header className="navbar navbar-simple">
        <div className="navbar-left">
          <img src="/LOGO.png" alt="Ziplofy Logo" className="navbar-logo" />
        </div>

        <div className="navbar-right" ref={userMenuRef}>
          <button
            className="username-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
          >
            {user?.name || "User"}
          </button>
          {userMenuOpen && (
            <div className="user-dropdown">
              <button
                className="user-dropdown-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/admin/profile");
                }}
              >
                <FaUser size={14} />
                Profile
              </button>
              <button
                className="user-dropdown-item"
                onClick={() => {
                  setTheme(theme === "light" ? "dark" : "light");
                  setUserMenuOpen(false);
                }}
              >
                {theme === "light" ? <FaMoon size={14} /> : <FaSun size={14} />}
                Theme ({theme === "light" ? "Light" : "Dark"})
              </button>
              <button
                className="user-dropdown-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  setShowSettingsModal(true);
                }}
              >
                <FaCog size={14} />
                Settings
              </button>
              <button
                className="user-dropdown-item user-dropdown-logout"
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
              >
                <FaSignOutAlt size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        activeItem={activeMenu}
        onSelect={handleSelect}
      />

      <div
        className="main-content"
        style={{
          marginLeft: sidebarOpen ? 272 : 60,
          padding: 12,
          transition: "margin-left 0.3s ease",
        }}
      >
        {location.pathname === "/admin/profile" ? (
          <Profile />
        ) : location.pathname.startsWith("/admin/themes/edit/") ? (
          <ThemeEditPage />
        ) : location.pathname.match(/\/admin\/client\/[^/]+\/analytics/) ? (
          <ClientAnalytics />
        ) : location.pathname.match(/\/admin\/client\/[^/]+\/stores/) ? (
          <ClientStores />
        ) : location.pathname.match(/\/admin\/client\/[^/]+/) ? (
          <ClientDetail />
        ) : (
          <>
            {activeMenu === "Client List" && isSuperAdmin && <ClientList />}
            {((activeMenu === "Client List" && !isSuperAdmin) || activeMenu === "Payment") && <Payment />}
            {activeMenu === "Invoice" && <Invoice />}
            {activeMenu === "Manage User" && <ManageUser />}
            {activeMenu === "Roles & Permission" && <RolesPermission />}
            {activeMenu === "Domain" && <Domain />}
            {activeMenu === "Ticket" && <Ticket />}
            {activeMenu === "Raise Task" && <RaiseTask />}
            {activeMenu === "Live Support" && <LiveSupport />}
            {activeMenu === "Membership Plan" && <MembershipPlan />}
            {activeMenu === "Dev Admin" && <DevAdmin />}
            {activeMenu === "Theme Developer" && <ThemeDeveloper />}
            {activeMenu === "Support Developer" && <SupportDeveloper />}
            {activeMenu === "Hire Developer Requests" && <DevRequests />}
            {activeMenu === "Activity Logs" && <ActivityLogs />}
          </>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3>Settings</h3>
              <button className="profile-modal-close" onClick={() => setShowSettingsModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="settings-modal-body">
              <div className="settings-option">
                <div>
                  <strong>Email Notifications</strong>
                  <p>Receive email updates and alerts</p>
                </div>
                <label className="toggle-switch-settings">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings((s) => ({ ...s, emailNotifications: e.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="settings-option">
                <div>
                  <strong>Push Notifications</strong>
                  <p>Show browser notifications</p>
                </div>
                <label className="toggle-switch-settings">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings((s) => ({ ...s, pushNotifications: e.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="settings-option">
                <div>
                  <strong>Weekly Digest</strong>
                  <p>Receive a weekly summary email</p>
                </div>
                <label className="toggle-switch-settings">
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigest}
                    onChange={(e) => setSettings((s) => ({ ...s, weeklyDigest: e.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
