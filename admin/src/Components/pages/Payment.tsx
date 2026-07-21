import React from "react";
import "./PageCard.css";

const Payment: React.FC = () => {
  return (
    <div className="payment-page" style={{ padding: "24px 28px", background: "var(--z-surface)", minHeight: "calc(100vh - 80px)" }}>
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-title-block">
            <div className="page-title-accent" />
            <div>
              <h2 className="page-title">Payment</h2>
              <p className="page-subtitle">View and manage payments for your store</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "48px 28px", textAlign: "center", color: "var(--z-text-muted)" }}>
          No payment data yet
        </div>
      </div>
    </div>
  );
};

export default Payment;
