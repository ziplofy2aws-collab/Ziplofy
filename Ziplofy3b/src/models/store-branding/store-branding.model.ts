import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreBranding extends Document {
  storeId: mongoose.Types.ObjectId;
  // Logos
  defaultLogoUrl?: string;
  squareLogoUrl?: string;
  
  // Colors
  primaryColor?: string; // Hex color code (e.g., "#FF5733")
  contrastColor?: string; // Contrast color for primary (hex color code)
  secondaryColors?: string[]; // Array of hex color codes (max 2)
  secondaryContrastColor?: string; // Contrast color for secondary (hex color code)
  
  // Images
  coverImageUrl?: string;
  
  // Text
  slogan?: string; // Max 80 characters
  shortDescription?: string; // Max 150 characters
  
  // Social Links
  socialLinks?: Record<string, string>; // Platform name -> URL mapping
}

const storeBrandingSchema = new Schema<IStoreBranding>(
  {
    storeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Store', 
      required: true, 
      index: true, 
      unique: true 
    },
    // Logos
    defaultLogoUrl: { 
      type: String, 
      trim: true,
      default: undefined 
    },
    squareLogoUrl: { 
      type: String, 
      trim: true,
      default: undefined 
    },
    
    // Colors
    primaryColor: { 
      type: String, 
      trim: true,
      match: /^#[0-9A-Fa-f]{6}$/, // Hex color validation
      default: undefined 
    },
    contrastColor: { 
      type: String, 
      trim: true,
      match: /^#[0-9A-Fa-f]{6}$/, // Hex color validation
      default: undefined 
    },
    secondaryColors: { 
      type: [String], 
      validate: {
        validator: function(v: string[]) {
          // Max 2 secondary colors and each must be valid hex color
          if (!v) return true;
          if (v.length > 2) return false;
          return v.every(color => /^#[0-9A-Fa-f]{6}$/.test(color));
        },
        message: 'Maximum 2 secondary colors allowed, and each must be a valid hex color code'
      },
      default: undefined 
    },
    secondaryContrastColor: { 
      type: String, 
      trim: true,
      match: /^#[0-9A-Fa-f]{6}$/, // Hex color validation
      default: undefined 
    },
    
    // Images
    coverImageUrl: { 
      type: String, 
      trim: true,
      default: undefined 
    },
    
    // Text
    slogan: { 
      type: String, 
      trim: true,
      maxlength: [80, 'Slogan cannot exceed 80 characters'],
      default: undefined 
    },
    shortDescription: { 
      type: String, 
      trim: true,
      maxlength: [150, 'Short description cannot exceed 150 characters'],
      default: undefined 
    },
    
    // Social Links
    socialLinks: { 
      type: Schema.Types.Mixed,
      default: undefined 
    },
  },
  { timestamps: true, versionKey: false }
);

// Index for efficient queries
storeBrandingSchema.index({ storeId: 1 });

export const StoreBranding: Model<IStoreBranding> =
  mongoose.models.StoreBranding || mongoose.model<IStoreBranding>('StoreBranding', storeBrandingSchema);

