import { ChangeEvent, FormEvent, useState } from "react";
import { Mail, Save, RotateCcw, User } from "lucide-react";
import { useSupportDevelopers } from '../../contexts/supportdeveloper.context';
import './DevAdmin.css';

// ---------------------- Types ----------------------
interface FormData {
  email: string;
  username: string;
}

interface FormErrors {
  email?: string;
  username?: string;
}

interface AddSupportDeveloperResult {
  success: boolean;
  error?: string;
}

// ---------------------- Component ----------------------
const DevAdmin = () => {
  const { addSupportDeveloper } = useSupportDevelopers();

  const [formData, setFormData] = useState<FormData>({ email: '', username: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await addSupportDeveloper({
        email: formData.email,
        username: formData.username,
      });
      setFormData({ email: '', username: '' });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ email: '', username: '' });
    setErrors({});
  };

  return (
    <div className="dev-admin-page main-content">
      <div className="dev-admin-card">
        <div className="dev-admin-card-header">
          <div className="dev-admin-title-block">
            <div className="dev-admin-title-accent" />
            <div>
              <h1 className="dev-admin-title">Developer Administration</h1>
              <p className="dev-admin-subtitle">Manage support developers and team members</p>
            </div>
          </div>
        </div>

        {/* Add Support Developer Form */}
      <div className="form-section">
        <div className="form-header">
          <h2>Add New Support Developer</h2>
          <p>Create a new support developer account</p>
        </div>

        <form onSubmit={handleSubmit} className="support-developer-form">
          <div className="form-grid">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter email address"
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User size={16} />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter username"
                disabled={isSubmitting}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Save size={16} />
              {isSubmitting ? 'Adding...' : 'Add Support Developer'}
            </button>
          </div>
        </form>
        </div>

        {/* Additional Info */}
        <div className="info-section">
          <div className="info-card">
            <h3>Support Developer Role</h3>
            <p>Support developers help clients with technical issues, provide guidance, and assist with development tasks.</p>
            <ul>
              <li>Handle client support tickets</li>
              <li>Provide technical assistance</li>
              <li>Debug and troubleshoot issues</li>
              <li>Guide clients through development processes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevAdmin;
