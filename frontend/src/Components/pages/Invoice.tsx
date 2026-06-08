import React from "react";
import "./PageCard.css";

const Invoice: React.FC = () => {
  return (
    <div className="invoice-page" style={{ padding: "24px 28px", background: "var(--z-surface)", minHeight: "calc(100vh - 80px)" }}>
      <div className="page-card">
        <div className="page-card-header">
          <div className="page-title-block">
            <div className="page-title-accent" />
            <div>
              <h2 className="page-title">Invoice</h2>
              <p className="page-subtitle">View and manage invoices for your store</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "48px 28px", textAlign: "center", color: "var(--z-text-muted)" }}>
          No invoice data yet
        </div>
      </div>
    </div>
  );
};

export default Invoice;
