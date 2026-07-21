import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosi from "../../config/axios";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import "./ThemeEditPage.css";

interface Theme {
  _id: string;
  name: string;
  description?: string;
  category: string;
  plan: string;
  price?: number;
  version?: string;
  tags?: string[];
  thumbnailUrl?: string;
}

const ThemeEditPage: React.FC = () => {
  const location = useLocation();
  const { themeId: themeIdFromParams } = useParams<{ themeId: string }>();
  // Try useParams first, fallback to extracting from pathname
  const themeId = (themeIdFromParams || location.pathname.split('/admin/themes/edit/')[1]?.split('/')[0] || '').trim();
  const navigate = useNavigate();
  
  console.log('🎨 ThemeEditPage rendered', { themeId, themeIdFromParams, pathname: location.pathname });
  
  // Validate themeId format (MongoDB ObjectId is 24 hex characters)
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(themeId);
  if (themeId && !isValidObjectId) {
    console.warn('⚠️ Theme ID format might be invalid:', themeId);
  }
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<Theme | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    plan: "",
    price: "",
    version: "1.0.0",
    tags: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Fetch theme data
  useEffect(() => {
    const fetchTheme = async () => {
      if (!themeId) {
        setError("Theme ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('📡 Fetching theme with ID:', themeId);
        console.log('📡 Request URL:', `/themes/${themeId}`);
        
        const response = await axiosi.get(`/themes/${themeId}`);
        console.log('✅ Theme fetch response:', response.data);
        
        if (response.data.success) {
          const themeData = response.data.data || response.data;
          console.log('📦 Theme data:', themeData);
          setTheme(themeData);
          
          // Normalize category and plan to lowercase to match enum values
          const normalizedCategory = themeData.category ? themeData.category.toLowerCase() : "";
          const normalizedPlan = themeData.plan ? themeData.plan.toLowerCase() : "";
          
          setFormData({
            name: themeData.name || "",
            description: themeData.description || "",
            category: normalizedCategory,
            plan: normalizedPlan,
            price: themeData.price?.toString() || "",
            version: themeData.version || "1.0.0",
            tags: Array.isArray(themeData.tags) ? themeData.tags.join(", ") : themeData.tags || "",
          });
          if (themeData.thumbnailUrl) {
            setThumbnailPreview(themeData.thumbnailUrl);
          }
        } else {
          setError("Failed to load theme data");
        }
      } catch (error: any) {
        console.error("Error fetching theme:", error);
        console.error("Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          themeId
        });
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Failed to load theme. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [themeId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setThumbnailFile(file);
      setError(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setThumbnailFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeId) {
      setError("Theme ID is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.plan) {
        throw new Error("Please fill in all required fields");
      }

      // Create FormData
      const updateFormData = new FormData();
      updateFormData.append('name', formData.name);
      
      // Only append fields that have values (avoid empty strings)
      if (formData.description) {
        updateFormData.append('description', formData.description);
      }
      updateFormData.append('category', formData.category);
      updateFormData.append('plan', formData.plan);
      
      // Convert price to number if provided
      if (formData.price && formData.price.trim() !== '') {
        const priceNum = parseFloat(formData.price);
        if (!isNaN(priceNum)) {
          updateFormData.append('price', priceNum.toString());
        }
      }
      
      if (formData.version) {
        updateFormData.append('version', formData.version);
      }
      
      if (formData.tags) {
        updateFormData.append('tags', formData.tags);
      }
      
      if (thumbnailFile) {
        updateFormData.append('thumbnail', thumbnailFile);
      }

      console.log('📤 Sending update request:', {
        themeId,
        name: formData.name,
        category: formData.category,
        plan: formData.plan,
        hasThumbnail: !!thumbnailFile,
        formDataKeys: Array.from(updateFormData.keys())
      });

      // Make API call
      const response = await axiosi.put(`/themes/${themeId}`, updateFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Update response:', response.data);

      if (response.data.success) {
        // Show success toast
        toast.success("Theme updated successfully!", {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#10b981",
            color: "#fff",
            fontWeight: 500,
          },
        });
        
        // Update local theme state
        setTheme(prev => prev ? { ...prev, ...formData } : null);
        setThumbnailFile(null);
        // Refresh thumbnail preview if URL changed
        if (response.data.data?.thumbnailUrl) {
          setThumbnailPreview(response.data.data.thumbnailUrl);
        }
        
        // Navigate back to theme developer section after a short delay
        // Store the active menu in sessionStorage so Navbar can restore it
        sessionStorage.setItem('activeMenu', 'Theme Developer');
        setTimeout(() => {
          // Navigate back to previous page (Theme Developer section)
          navigate(-1);
        }, 500);
      } else {
        throw new Error(response.data.message || "Failed to update theme");
      }
    } catch (error: any) {
      console.error("Error updating theme:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           "Failed to update theme. Please try again.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-edit-page">
        <div className="theme-edit-loading">
          <div className="loading-spinner"></div>
          <p>Loading theme data...</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Theme ID: {themeId || 'Not found'}</p>
        </div>
      </div>
    );
  }

  if (error && !theme) {
    return (
      <div className="theme-edit-page">
        <div className="theme-edit-error">
          <p>{error}</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>Theme ID: {themeId || 'Not found'}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-edit-page">
      <div className="theme-edit-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Edit Theme: {theme?.name || "Unknown"}</h1>
      </div>

      {error && (
        <div className="alert alert-error">
          <X size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="theme-edit-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">
              Theme Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter theme name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter theme description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select category</option>
                <option value="travel">Travel</option>
                <option value="business">Business</option>
                <option value="portfolio">Portfolio</option>
                <option value="ecommerce">E-commerce</option>
                <option value="blog">Blog</option>
                <option value="education">Education</option>
                <option value="health">Health</option>
                <option value="food">Food</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="plan">
                Plan <span className="required">*</span>
              </label>
              <select
                id="plan"
                name="plan"
                value={formData.plan}
                onChange={handleInputChange}
                required
              >
                <option value="">Select plan</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="version">Version</label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="e.g., modern, responsive, e-commerce"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Thumbnail</h2>
          
          <div className="thumbnail-upload-area">
            {thumbnailPreview ? (
              <div className="thumbnail-preview-container">
                <img src={thumbnailPreview} alt="Theme thumbnail" className="thumbnail-preview" />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreview(theme?.thumbnailUrl || null);
                  }}
                  className="btn-remove-thumbnail"
                >
                  <X size={16} /> Remove
                </button>
              </div>
            ) : (
              <div
                className="thumbnail-dropzone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={48} />
                <p>Click to upload or drag and drop</p>
                <p className="dropzone-hint">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={{ display: 'none' }}
            />
            
            {thumbnailPreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-change-thumbnail"
              >
                <Upload size={16} /> Change Thumbnail
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="loading-spinner-small"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ThemeEditPage;

