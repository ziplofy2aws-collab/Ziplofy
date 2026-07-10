import React, { useCallback, useEffect, useState } from "react";
import { Check, X, Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../../config/axios";
import "./MembershipPlan.css";

interface Feature {
  name: string;
  included: boolean;
}

interface Plan {
  _id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: Feature[];
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

const emptyPlanForm = (): Omit<Plan, "_id"> => ({
  name: "",
  description: "",
  priceMonthly: 0,
  priceYearly: 0,
  features: [{ name: "", included: true }],
  isPopular: false,
  isActive: true,
  sortOrder: 0,
});

const MembershipPlan: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<Omit<Plan, "_id">>(emptyPlanForm());
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isSuperAdmin =
    localStorage.getItem("isSuperAdmin") === "true" ||
    localStorage.getItem("userRole") === "super-admin";

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/membership-plans");
      const data = res.data?.data ?? res.data ?? [];
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load membership plans:", err);
      toast.error("Failed to load membership plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({ ...emptyPlanForm(), sortOrder: plans.length });
    setShowModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      features: plan.features.length ? plan.features : [{ name: "", included: true }],
      isPopular: plan.isPopular ?? false,
      isActive: plan.isActive ?? true,
      sortOrder: plan.sortOrder ?? 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setForm(emptyPlanForm());
  };

  const updateFeature = (index: number, field: keyof Feature, value: string | boolean) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = { ...features[index], [field]: value };
      return { ...prev, features };
    });
  };

  const addFeatureRow = () => {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { name: "", included: true }],
    }));
  };

  const removeFeatureRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedFeatures = form.features
      .map((f) => ({ name: f.name.trim(), included: f.included }))
      .filter((f) => f.name);

    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Plan name and description are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        features: cleanedFeatures,
        priceMonthly: Number(form.priceMonthly),
        priceYearly: Number(form.priceYearly),
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editingPlan) {
        await axios.put(`/membership-plans/${editingPlan._id}`, payload);
        toast.success("Plan updated successfully");
      } else {
        await axios.post("/membership-plans", payload);
        toast.success("Plan created successfully");
      }

      closeModal();
      fetchPlans();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to save plan";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/membership-plans/${id}`);
      toast.success("Plan deleted successfully");
      setDeleteConfirmId(null);
      fetchPlans();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to delete plan";
      toast.error(message);
    }
  };

  return (
    <div className="membership-plans-page">
      <div className="mp-page-card">
        <div className="mp-page-header">
          <div className="mp-title-block">
            <div className="mp-title-accent" />
            <div>
              <h1 className="mp-title">Membership Plans</h1>
              <p className="mp-subtitle">Select the best plan for your business needs</p>
            </div>
          </div>
          {isSuperAdmin && (
            <button type="button" className="mp-add-btn" onClick={openCreateModal}>
              <Plus size={18} />
              Add Plan
            </button>
          )}
        </div>

        <div className="mp-section">
          <h2 className="mp-section-title">
            Select the <span className="mp-highlight">best plan</span> for your needs
          </h2>
          <div className="mp-toggle">
            <span className={`mp-toggle-label ${billingCycle === "monthly" ? "active" : ""}`}>
              Monthly Plan
            </span>
            <button
              type="button"
              className={`mp-toggle-switch ${billingCycle === "yearly" ? "yearly" : ""}`}
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            >
              <span className="mp-toggle-thumb" />
            </button>
            <span className={`mp-toggle-label ${billingCycle === "yearly" ? "active" : ""}`}>
              Yearly Plan
            </span>
          </div>
        </div>

        {loading ? (
          <div className="mp-loading">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="mp-empty">
            <p>No membership plans available yet.</p>
            {isSuperAdmin && (
              <button type="button" className="mp-add-btn" onClick={openCreateModal}>
                <Plus size={18} />
                Create your first plan
              </button>
            )}
          </div>
        ) : (
          <div className="mp-cards">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`mp-card ${plan.isPopular ? "mp-card-popular" : ""}`}
              >
                {plan.isPopular && <div className="mp-popular-tag">Most Popular</div>}

                {isSuperAdmin && (
                  <div className="mp-card-actions">
                    <button
                      type="button"
                      className="mp-icon-btn"
                      onClick={() => openEditModal(plan)}
                      title="Edit plan"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      className="mp-icon-btn mp-icon-btn-danger"
                      onClick={() => setDeleteConfirmId(plan._id)}
                      title="Delete plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                <div className="mp-card-header">
                  <h3 className="mp-card-title">{plan.name}</h3>
                  <p className="mp-card-desc">{plan.description}</p>
                  <div className="mp-card-price">
                    <span className="mp-price-amount">
                      ₹{billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                    </span>
                    <span className="mp-price-period">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mp-active-btn ${plan.isPopular ? "mp-active-btn-solid" : ""}`}
                >
                  Active Plan
                </button>

                <ul className="mp-features">
                  {plan.features.map((f, i) => (
                    <li key={`${plan._id}-feature-${i}`} className="mp-feature">
                      {f.included ? (
                        <Check size={18} className="mp-feature-check" />
                      ) : (
                        <X size={18} className="mp-feature-x" />
                      )}
                      <span>{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="mp-modal-overlay" onClick={closeModal}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3>{editingPlan ? "Edit Plan" : "Add New Plan"}</h3>
              <button type="button" className="mp-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form className="mp-modal-body" onSubmit={handleSubmit}>
              <div className="mp-form-row">
                <label htmlFor="mp-plan-name">Plan Name</label>
                <input
                  id="mp-plan-name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Growth Plan"
                  required
                />
              </div>

              <div className="mp-form-row">
                <label htmlFor="mp-plan-desc">Description</label>
                <textarea
                  id="mp-plan-desc"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short plan description"
                  rows={2}
                  required
                />
              </div>

              <div className="mp-form-grid">
                <div className="mp-form-row">
                  <label htmlFor="mp-price-monthly">Monthly Price (₹)</label>
                  <input
                    id="mp-price-monthly"
                    type="number"
                    min={0}
                    value={form.priceMonthly}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priceMonthly: Number(e.target.value) }))
                    }
                    required
                  />
                </div>
                <div className="mp-form-row">
                  <label htmlFor="mp-price-yearly">Yearly Price (₹)</label>
                  <input
                    id="mp-price-yearly"
                    type="number"
                    min={0}
                    value={form.priceYearly}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priceYearly: Number(e.target.value) }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="mp-form-grid">
                <div className="mp-form-row">
                  <label htmlFor="mp-sort-order">Display Order</label>
                  <input
                    id="mp-sort-order"
                    type="number"
                    min={0}
                    value={form.sortOrder ?? 0}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="mp-form-checks">
                  <label className="mp-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isPopular}
                      onChange={(e) => setForm((p) => ({ ...p, isPopular: e.target.checked }))}
                    />
                    Mark as Most Popular
                  </label>
                  <label className="mp-checkbox">
                    <input
                      type="checkbox"
                      checked={form.isActive ?? true}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                    />
                    Active (visible on platform)
                  </label>
                </div>
              </div>

              <div className="mp-features-editor">
                <div className="mp-features-editor-header">
                  <label>Features</label>
                  <button type="button" className="mp-add-feature-btn" onClick={addFeatureRow}>
                    <Plus size={14} />
                    Add Feature
                  </button>
                </div>

                {form.features.map((feature, index) => (
                  <div key={`feature-row-${index}`} className="mp-feature-row">
                    <input
                      value={feature.name}
                      onChange={(e) => updateFeature(index, "name", e.target.value)}
                      placeholder="Feature name"
                    />
                    <label className="mp-checkbox mp-feature-included">
                      <input
                        type="checkbox"
                        checked={feature.included}
                        onChange={(e) => updateFeature(index, "included", e.target.checked)}
                      />
                      Included
                    </label>
                    {form.features.length > 1 && (
                      <button
                        type="button"
                        className="mp-icon-btn mp-icon-btn-danger"
                        onClick={() => removeFeatureRow(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mp-modal-footer">
                <button type="button" className="mp-btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="mp-btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="mp-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="mp-delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Plan?</h3>
            <p>This action cannot be undone. The plan will be removed from the platform.</p>
            <div className="mp-modal-footer">
              <button type="button" className="mp-btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="mp-btn-danger"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlan;
