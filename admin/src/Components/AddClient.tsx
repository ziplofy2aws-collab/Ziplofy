import React, { useState, ChangeEvent, FormEvent } from "react";

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: "Active" | "Inactive";
}

interface AddClientProps {
  onClose: () => void;
  onSubmit?: (form: ClientForm) => void;
}

const AddClient: React.FC<AddClientProps> = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState<ClientForm>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    status: "Active",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add New Client</h3>
        <form onSubmit={handleSubmit} className="add-client-form">
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Company
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
            />
          </label>
          <label>
            Address
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Add Client
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClient;
