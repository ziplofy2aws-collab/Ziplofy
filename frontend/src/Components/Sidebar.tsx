import React, { useState } from "react";
import {
  FaUsers,
  FaWallet,
  FaUserCog,
  FaLifeRing,
  FaIdBadge,
  FaCode,
  FaChevronDown,
  FaUserShield,
  FaBars,
  FaHistory,
} from "react-icons/fa";
import { usePermissions } from "../hooks/usePermissions";
import "./Sidebar.css";

interface SidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
  activeItem?: string;
  onSelect?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activeItem, onSelect }) => {
  const [openSection, setOpenSection] = useState<string>("");
  const { hasViewPermission, loading, permissions, user } = usePermissions();

  const toggle = (section: string) => {
    setOpenSection((prev) => (prev === section ? "" : section));
  };

  // Show loading state while fetching permissions (include toggle so it's always usable)
  if (loading) {
    return (
      <>
        <button
          className="sidebar-toggle-tab"
          aria-label="Toggle sidebar"
          onClick={() => onToggle?.()}
          title="Expand sidebar"
        >
          <FaBars />
        </button>
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
          <div className="sidebar-loading">
            <span>Loading permissions...</span>
          </div>
        </aside>
      </>
    );
  }

  // Fallback: if no permissions are loaded and user is super-admin, show all sections
  const isSuperAdmin = user?.roleName === 'super-admin' || localStorage.getItem('isSuperAdmin') === 'true';
  const hasAnyPermissions = Object.keys(permissions).length > 0;
  
  // Emergency fallback: if user is super-admin and no permissions loaded, show all sections
  const shouldShowAllSections = isSuperAdmin && !hasAnyPermissions;

  // Derived visibility: show parent section if any subsection is viewable
  const canSeeUserManagement = shouldShowAllSections ||
    hasViewPermission("User Management") ||
    hasViewPermission("User Management", "Manage User") ||
    hasViewPermission("User Management", "Roles and Permission");

  const canSeeMembership = shouldShowAllSections ||
    hasViewPermission("Membership") ||
    hasViewPermission("Membership", "Membership Plan");

  const canSeeDeveloper = shouldShowAllSections ||
    hasViewPermission("Developer") ||
    hasViewPermission("Developer", "Dev Admin") ||
    hasViewPermission("Developer", "Theme Developer") ||
    hasViewPermission("Developer", "Support Developer") ||
    hasViewPermission("Developer", "Hire Developer Requests");

  const canSeeSupport = shouldShowAllSections ||
    hasViewPermission("Support") ||
    hasViewPermission("Support", "Domain") ||
    hasViewPermission("Support", "Ticket") ||
    hasViewPermission("Support", "Raise Task") ||
    hasViewPermission("Support", "Live Support");

  return (
    <>
      {!isOpen && (
        <button
          className="sidebar-toggle-tab"
          aria-label="Toggle sidebar"
          onClick={() => onToggle?.()}
          title="Expand sidebar"
        >
          <FaBars />
        </button>
      )}
      <aside
        className={`sidebar ${isOpen ? "open" : ""}`}
      >
      <div className="sidebar-header">
        <FaUserShield className="sidebar-icon" />
        <span className="sidebar-role-label">
          {user?.roleName || user?.role || localStorage.getItem('userRole') || (loading ? 'Loading...' : 'User')}
        </span>
        {isOpen && (
          <button
            className="sidebar-toggle-in-header"
            aria-label="Collapse sidebar"
            onClick={() => onToggle?.()}
            title="Collapse sidebar"
          >
            <FaBars />
          </button>
        )}
      </div>

      <ul className="sidebar-menu">
        <p className="sidebar-section-title">Main Menu</p>

        {isSuperAdmin && (
          <li
            className={activeItem === "Client List" ? "active" : ""}
            onClick={() => onSelect && onSelect("Client List")}
          >
            <FaUsers className="menu-icon" />
            <span>Client List</span>
          </li>
        )}

        {(hasViewPermission("Payment") || shouldShowAllSections) && (
          <li
            className={activeItem === "Payment" ? "active" : ""}
            onClick={() => onSelect && onSelect("Payment")}
          >
            <FaWallet className="menu-icon" />
            <span>Payment</span>
          </li>
        )}

        {(hasViewPermission("Invoice") || shouldShowAllSections) && (
          <li
            className={activeItem === "Invoice" ? "active" : ""}
            onClick={() => onSelect && onSelect("Invoice")}
          >
            <FaWallet className="menu-icon" />
            <span>Invoice</span>
          </li>
        )}

        {canSeeUserManagement && (
          <>
            <p className="sidebar-section-title">User & Access</p>

            <li
              className={`has-sub ${openSection === "UserManagement" ? "open" : ""}`}
              onClick={() => toggle("UserManagement")}
            >
              <div className="menu-row">
                <FaUserCog className="menu-icon" />
                <span>User Management</span>
                <FaChevronDown className={`chev ${openSection === "UserManagement" ? "rotated" : ""}`} />
              </div>
            </li>
            {openSection === "UserManagement" && (
              <ul className="submenu">
                {hasViewPermission("User Management", "Manage User") && (
                  <li
                    className={activeItem === "Manage User" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Manage User")}
                  >
                    <span className="dot">•</span>
                    <span>Manage User</span>
                  </li>
                )}
                {hasViewPermission("User Management", "Roles and Permission") && (
                  <li
                    className={activeItem === "Roles & Permission" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Roles & Permission")}
                  >
                    <span className="dot">•</span>
                    <span>Roles and Permission</span>
                  </li>
                )}
              </ul>
            )}
          </>
        )}

        {canSeeMembership && (
          <>
            <p className="sidebar-section-title">Membership</p>
            <li
              className={`has-sub ${openSection === "Membership" ? "open" : ""}`}
              onClick={() => toggle("Membership")}
            >
              <div className="menu-row">
                <FaIdBadge className="menu-icon" />
                <span>Membership</span>
                <FaChevronDown className={`chev ${openSection === "Membership" ? "rotated" : ""}`} />
              </div>
            </li>
            {openSection === "Membership" && (
              <ul className="submenu">
                {hasViewPermission("Membership", "Membership Plan") && (
                  <li
                    className={activeItem === "Membership Plan" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Membership Plan")}
                  >
                    <span className="dot">•</span>
                    <span>Membership Plan</span>
                  </li>
                )}
              </ul>
            )}
          </>
        )}

        {canSeeDeveloper && (
          <>
            <p className="sidebar-section-title">Developer</p>
            <li
              className={`has-sub ${openSection === "Developer" ? "open" : ""}`}
              onClick={() => toggle("Developer")}
            >
              <div className="menu-row">
                <FaCode className="menu-icon" />
                <span>Developer</span>
                <FaChevronDown className={`chev ${openSection === "Developer" ? "rotated" : ""}`} />
              </div>
            </li>
            {openSection === "Developer" && (
              <ul className="submenu">
                {hasViewPermission("Developer", "Dev Admin") && (
                  <li
                    className={activeItem === "Dev Admin" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Dev Admin")}
                  >
                    <span className="dot">•</span>
                    <span>Dev Admin</span>
                  </li>
                )}
                {hasViewPermission("Developer", "Theme Developer") && (
                  <li
                    className={activeItem === "Theme Developer" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Theme Developer")}
                  >
                    <span className="dot">•</span>
                    <span>Theme Developer</span>
                  </li>
                )}
                {hasViewPermission("Developer", "Support Developer") && (
                  <li
                    className={activeItem === "Support Developer" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Support Developer")}
                  >
                    <span className="dot">•</span>
                    <span>Support Developer</span>
                  </li>
                )}
                {hasViewPermission("Developer", "Hire Developer Requests") && (
                  <li
                    className={activeItem === "Hire Developer Requests" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Hire Developer Requests")}
                  >
                    <span className="dot">•</span>
                    <span>Hire Developer Requests</span>
                  </li>
                )}
              </ul>
            )}
          </>
        )}

        {canSeeSupport && (
          <>
            <p className="sidebar-section-title">Support</p>
            <li
              className={`has-sub ${openSection === "Support" ? "open" : ""}`}
              onClick={() => toggle("Support")}
            >
              <div className="menu-row">
                <FaLifeRing className="menu-icon" />
                <span>Support</span>
                <FaChevronDown className={`chev ${openSection === "Support" ? "rotated" : ""}`} />
              </div>
            </li>
            {openSection === "Support" && (
              <ul className="submenu">
                {hasViewPermission("Support", "Domain") && (
                  <li
                    className={activeItem === "Domain" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Domain")}
                  >
                    <span className="dot">•</span>
                    <span>Domain</span>
                  </li>
                )}
                {hasViewPermission("Support", "Ticket") && (
                  <li
                    className={activeItem === "Ticket" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Ticket")}
                  >
                    <span className="dot">•</span>
                    <span>Ticket</span>
                  </li>
                )}
                {hasViewPermission("Support", "Raise Task") && (
                  <li
                    className={activeItem === "Raise Task" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Raise Task")}
                  >
                    <span className="dot">•</span>
                    <span>Raise Task</span>
                  </li>
                )}
                {hasViewPermission("Support", "Live Support") && (
                  <li
                    className={activeItem === "Live Support" ? "active" : ""}
                    onClick={() => onSelect && onSelect("Live Support")}
                  >
                    <span className="dot">•</span>
                    <span>Live Support</span>
                  </li>
                )}
              </ul>
            )}
          </>
        )}

        {isSuperAdmin && (
          <>
            <p className="sidebar-section-title">Audit</p>
            <li
              className={activeItem === "Activity Logs" ? "active" : ""}
              onClick={() => onSelect && onSelect("Activity Logs")}
            >
              <FaHistory className="menu-icon" />
              <span>Activity Logs</span>
            </li>
          </>
        )}
      </ul>
    </aside>
    </>
  );
};

export default Sidebar;
