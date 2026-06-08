import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../../config/database.config";
import { Category, ICategory } from "../../models/category/category.model";

// Load environment variables
dotenv.config();

const categoryTree = {
  "Apparel & Accessories": {
    "Clothing": {
      "Tops": {},
      "Bottoms": {},
      "Dresses": {},
      "Outerwear": {},
      "Activewear": {},
      "Sleepwear & Loungewear": {}
    },
    "Footwear": {
      "Sneakers": {},
      "Boots": {},
      "Sandals": {},
      "Formal Shoes": {},
      "Slippers": {}
    },
    "Bags & Wallets": {
      "Backpacks": {},
      "Handbags": {},
      "Travel Bags": {},
      "Laptop Bags": {},
      "Wallets & Card Holders": {}
    },
    "Jewelry": {
      "Necklaces": {},
      "Bracelets": {},
      "Earrings": {},
      "Rings": {},
      "Watches": {
        "By Gender": {
          "Men's Watches": {},
          "Women's Watches": {},
          "Unisex Watches": {},
          "Kids' Watches": {}
        },
        "By Display Type": {
          "Analog Watches": {},
          "Digital Watches": {},
          "Analog-Digital Watches": {},
          "Smart Watches": {}
        },
        "By Movement": {
          "Quartz Watches": {},
          "Automatic Watches": {},
          "Mechanical Manual Watches": {},
          "Solar Watches": {},
          "Kinetic Watches": {}
        },
        "By Strap Material": {
          "Stainless Steel Strap Watches": {},
          "Leather Strap Watches": {},
          "Silicone Strap Watches": {},
          "Nylon Strap Watches": {},
          "Ceramic Strap Watches": {},
          "Titanium Strap Watches": {}
        },
        "By Case Material": {
          "Stainless Steel Case Watches": {},
          "Titanium Case Watches": {},
          "Ceramic Case Watches": {},
          "Resin Case Watches": {},
          "Gold Plated Case Watches": {}
        },
        "By Style": {
          "Dress Watches": {},
          "Casual Watches": {},
          "Sport Watches": {},
          "Luxury Watches": {},
          "Minimalist Watches": {},
          "Fashion Watches": {},
          "Vintage Watches": {}
        },
        "By Features": {
          "Chronograph Watches": {},
          "GMT Watches": {},
          "Diver Watches": {},
          "Pilot Watches": {},
          "Field Watches": {},
          "Moonphase Watches": {},
          "Skeleton Watches": {},
          "Perpetual Calendar Watches": {},
          "Alarm Watches": {},
          "World Time Watches": {}
        },
        "By Occasion": {
          "Everyday Wear Watches": {},
          "Formal Occasion Watches": {},
          "Party Wear Watches": {},
          "Office Wear Watches": {},
          "Travel Watches": {},
          "Wedding Watches": {}
        },
        "By Water Resistance": {
          "30m Water Resistant Watches": {},
          "50m Water Resistant Watches": {},
          "100m Water Resistant Watches": {},
          "200m+ Water Resistant Watches": {}
        },
        "Watch Accessories": {
          "Watch Straps & Bands": {},
          "Metal Bracelets for Watches": {},
          "Watch Buckles & Clasps": {},
          "Watch Batteries": {},
          "Watch Winders": {},
          "Watch Storage Boxes": {},
          "Watch Protectors & Cases": {},
          "Watch Repair Tools": {},
          "Watch Cleaning Kits": {}
        },
        "Watch Parts": {
          "Watch Cases": {},
          "Watch Dials": {},
          "Watch Hands": {},
          "Watch Crowns": {},
          "Watch Crystals": {},
          "Watch Movements": {}
        },
        "Certified & Special Collections": {
          "Limited Edition Watches": {},
          "Collector Edition Watches": {},
          "Pre-Owned Watches": {},
          "Certified Refurbished Watches": {}
        }
      }
    },
    "Fashion Accessories": {
      "Belts": {},
      "Hats & Caps": {},
      "Sunglasses": {},
      "Scarves & Gloves": {},
      "Hair Accessories": {}
    }
  },
  "Electronics": {
    "Computers & Tablets": {
      "Laptops": {},
      "Desktop PCs": {},
      "Monitors": {},
      "Tablets": {},
      "Computer Components": {},
      "Computer Accessories": {}
    },
    "Phones & Accessories": {
      "Smartphones": {},
      "Feature Phones": {},
      "Cases & Covers": {},
      "Chargers & Cables": {},
      "Screen Protectors": {},
      "Power Banks": {}
    },
    "Audio": {
      "Headphones": {},
      "Earbuds": {},
      "Speakers": {},
      "Home Audio Systems": {},
      "Microphones": {}
    },
    "Cameras & Optics": {
      "Digital Cameras": {},
      "Lenses": {},
      "Tripods": {},
      "Action Cameras": {},
      "Drones": {},
      "Binoculars & Telescopes": {}
    },
    "Smart Home": {
      "Security Cameras": {},
      "Smart Lighting": {},
      "Smart Speakers": {},
      "Smart Plugs": {},
      "Home Automation Hubs": {}
    }
  },
  "Home & Garden": {
    "Furniture": {
      "Living Room Furniture": {},
      "Bedroom Furniture": {},
      "Dining Room Furniture": {},
      "Office Furniture": {},
      "Outdoor Furniture": {}
    },
    "Home Decor": {
      "Wall Decor": {},
      "Rugs & Carpets": {},
      "Curtains & Blinds": {},
      "Clocks": {},
      "Decorative Accents": {}
    },
    "Kitchen & Dining": {
      "Cookware": {},
      "Bakeware": {},
      "Dinnerware": {},
      "Drinkware": {},
      "Kitchen Tools & Gadgets": {},
      "Storage & Organization": {}
    },
    "Bedding & Bath": {
      "Bed Sheets": {},
      "Comforters & Duvets": {},
      "Pillows": {},
      "Towels": {},
      "Bathroom Accessories": {}
    },
    "Garden & Outdoor": {
      "Plants & Seeds": {},
      "Planters & Pots": {},
      "Gardening Tools": {},
      "Outdoor Decor": {},
      "BBQ & Outdoor Cooking": {}
    }
  },
  "Beauty & Personal Care": {
    "Skin Care": {
      "Cleansers": {},
      "Moisturizers": {},
      "Serums": {},
      "Sunscreen": {},
      "Face Masks": {}
    },
    "Hair Care": {
      "Shampoo": {},
      "Conditioner": {},
      "Hair Treatments": {},
      "Hair Styling Products": {},
      "Hair Tools": {}
    },
    "Makeup": {
      "Face Makeup": {},
      "Eye Makeup": {},
      "Lip Makeup": {},
      "Makeup Tools": {},
      "Makeup Removers": {}
    },
    "Fragrances": {
      "Perfume": {},
      "Body Mist": {},
      "Deodorants": {},
      "Gift Sets": {}
    },
    "Personal Care": {
      "Oral Care": {},
      "Body Care": {},
      "Shaving & Grooming": {},
      "Feminine Care": {},
      "Health & Wellness Devices": {}
    }
  },
  "Health & Wellness": {
    "Vitamins & Supplements": {
      "Multivitamins": {},
      "Protein & Sports Nutrition": {},
      "Omega & Fish Oil": {},
      "Herbal Supplements": {},
      "Immunity Support": {}
    },
    "Medical Supplies": {
      "First Aid": {},
      "Monitoring Devices": {},
      "Mobility Aids": {},
      "Respiratory Care": {},
      "Home Medical Equipment": {}
    },
    "Fitness": {
      "Cardio Equipment": {},
      "Strength Training": {},
      "Yoga & Pilates": {},
      "Resistance Bands": {},
      "Fitness Accessories": {}
    },
    "Sexual Wellness": {
      "Intimate Care": {},
      "Protection": {},
      "Lubricants": {},
      "Wellness Devices": {}
    }
  },
  "Food, Beverages & Tobacco": {
    "Grocery Staples": {
      "Rice, Grains & Pulses": {},
      "Flours & Baking Essentials": {},
      "Oils & Ghee": {},
      "Spices & Seasonings": {},
      "Sauces & Condiments": {}
    },
    "Snacks": {
      "Chips & Savory Snacks": {},
      "Nuts & Dry Fruits": {},
      "Biscuits & Cookies": {},
      "Chocolate & Candy": {}
    },
    "Beverages": {
      "Tea": {},
      "Coffee": {},
      "Juices & Soft Drinks": {},
      "Energy Drinks": {},
      "Health Drinks": {}
    },
    "Breakfast & Dairy": {
      "Breakfast Cereals": {},
      "Spreads & Jams": {},
      "Milk & Milk Alternatives": {},
      "Cheese & Butter": {}
    },
    "Tobacco & Alternatives": {
      "Cigars & Cigarettes": {},
      "Smokeless Tobacco": {},
      "Rolling Papers & Accessories": {},
      "Herbal Alternatives": {}
    }
  },
  "Baby & Toddler": {
    "Diapering": {
      "Diapers": {},
      "Wipes": {},
      "Diaper Bags": {},
      "Changing Mats": {}
    },
    "Feeding": {
      "Baby Bottles": {},
      "Breastfeeding Essentials": {},
      "Baby Food": {},
      "High Chairs": {},
      "Sterilizers & Warmers": {}
    },
    "Baby Gear": {
      "Strollers": {},
      "Car Seats": {},
      "Carriers": {},
      "Playards": {},
      "Walkers": {}
    },
    "Baby Clothing": {
      "Bodysuits": {},
      "Sleepwear": {},
      "Outerwear": {},
      "Footwear": {},
      "Accessories": {}
    },
    "Nursery": {
      "Cribs": {},
      "Mattresses": {},
      "Nursery Decor": {},
      "Baby Monitors": {},
      "Storage & Organization": {}
    }
  },
  "Toys & Games": {
    "Learning & Education": {
      "STEM Toys": {},
      "Puzzles": {},
      "Flash Cards": {},
      "Activity Kits": {}
    },
    "Action Figures & Collectibles": {
      "Action Figures": {},
      "Character Dolls": {},
      "Trading Cards": {},
      "Model Kits": {}
    },
    "Outdoor Play": {
      "Ride-Ons": {},
      "Sports Toys": {},
      "Water Toys": {},
      "Playhouses": {}
    },
    "Board Games & Card Games": {
      "Family Games": {},
      "Strategy Games": {},
      "Party Games": {},
      "Classic Games": {}
    },
    "Soft Toys & Dolls": {
      "Plush Toys": {},
      "Fashion Dolls": {},
      "Dollhouses": {},
      "Doll Accessories": {}
    }
  },
  "Sports & Outdoors": {
    "Team Sports": {
      "Cricket": {},
      "Football": {},
      "Basketball": {},
      "Badminton": {},
      "Volleyball": {}
    },
    "Cycling": {
      "Bicycles": {},
      "Helmets": {},
      "Cycling Apparel": {},
      "Bike Components": {},
      "Bike Accessories": {}
    },
    "Camping & Hiking": {
      "Tents": {},
      "Sleeping Bags": {},
      "Backpacks": {},
      "Camping Cookware": {},
      "Navigation & Survival Gear": {}
    },
    "Water Sports": {
      "Swimming Gear": {},
      "Kayaking": {},
      "Surfing": {},
      "Snorkeling & Diving": {}
    },
    "Gym & Training": {
      "Dumbbells & Weights": {},
      "Benches & Racks": {},
      "Mats": {},
      "Accessories": {}
    }
  },
  "Automotive": {
    "Car Electronics": {
      "Dash Cams": {},
      "Car Audio": {},
      "GPS & Navigation": {},
      "Phone Mounts": {},
      "Chargers & Adapters": {}
    },
    "Exterior Accessories": {
      "Car Covers": {},
      "Lighting": {},
      "Wipers": {},
      "Roof Racks": {},
      "Decals & Styling": {}
    },
    "Interior Accessories": {
      "Seat Covers": {},
      "Floor Mats": {},
      "Steering Covers": {},
      "Organizers": {},
      "Air Fresheners": {}
    },
    "Oils & Fluids": {
      "Engine Oil": {},
      "Coolants": {},
      "Brake Fluids": {},
      "Additives": {}
    },
    "Tools & Maintenance": {
      "Car Care Kits": {},
      "Cleaning Supplies": {},
      "Diagnostic Tools": {},
      "Repair Tools": {}
    }
  },
  "Hardware & Tools": {
    "Power Tools": {
      "Drills": {},
      "Saws": {},
      "Sanders": {},
      "Grinders": {},
      "Tool Combos": {}
    },
    "Hand Tools": {
      "Screwdrivers": {},
      "Wrenches": {},
      "Hammers": {},
      "Pliers": {},
      "Measuring Tools": {}
    },
    "Electrical": {
      "Switches & Sockets": {},
      "Wires & Cables": {},
      "Circuit Protection": {},
      "Lighting Fixtures": {}
    },
    "Plumbing": {
      "Fittings": {},
      "Pipes": {},
      "Valves": {},
      "Bathroom Plumbing": {},
      "Water Pumps": {}
    },
    "Safety & Security": {
      "Locks": {},
      "CCTV": {},
      "Safety Gear": {},
      "Fire Safety": {},
      "Access Control": {}
    }
  },
  "Office Supplies": {
    "Writing & Correction": {
      "Pens & Pencils": {},
      "Markers & Highlighters": {},
      "Correction Supplies": {},
      "Notebooks & Journals": {}
    },
    "Paper Products": {
      "Printer Paper": {},
      "Sticky Notes": {},
      "Envelopes": {},
      "Labels": {}
    },
    "Desk Organization": {
      "File Folders": {},
      "Desk Organizers": {},
      "Calendars & Planners": {},
      "Storage Boxes": {}
    },
    "Office Electronics": {
      "Printers": {},
      "Scanners": {},
      "Projectors": {},
      "Shredders": {},
      "Calculator & Label Makers": {}
    },
    "Presentation Supplies": {
      "Whiteboards": {},
      "Notice Boards": {},
      "Presentation Folders": {},
      "Display Supplies": {}
    }
  },
  "Pet Supplies": {
    "Dog Supplies": {
      "Dog Food": {},
      "Dog Treats": {},
      "Dog Toys": {},
      "Leashes & Collars": {},
      "Dog Beds": {}
    },
    "Cat Supplies": {
      "Cat Food": {},
      "Cat Treats": {},
      "Cat Toys": {},
      "Litter & Accessories": {},
      "Cat Furniture": {}
    },
    "Fish & Aquatic": {
      "Aquariums": {},
      "Fish Food": {},
      "Filters & Pumps": {},
      "Aquarium Decor": {}
    },
    "Bird Supplies": {
      "Bird Cages": {},
      "Bird Food": {},
      "Perches & Toys": {},
      "Cleaning Supplies": {}
    },
    "Small Pets": {
      "Rabbit Supplies": {},
      "Hamster Supplies": {},
      "Guinea Pig Supplies": {},
      "Habitat Accessories": {}
    }
  },
  "Arts & Entertainment": {
    "Art Supplies": {
      "Drawing": {},
      "Painting": {},
      "Craft Supplies": {},
      "Canvases & Paper": {},
      "Brushes & Tools": {}
    },
    "Musical Instruments": {
      "Guitars": {},
      "Keyboards": {},
      "Percussion": {},
      "Wind Instruments": {},
      "Accessories": {}
    },
    "Books & Magazines": {
      "Fiction": {},
      "Non-Fiction": {},
      "Children's Books": {},
      "Academic": {},
      "Comics & Graphic Novels": {}
    },
    "Party Supplies": {
      "Decorations": {},
      "Balloons": {},
      "Tableware": {},
      "Costumes": {},
      "Gift Wrap": {}
    },
    "Collectibles": {
      "Coins & Stamps": {},
      "Memorabilia": {},
      "Limited Edition Items": {},
      "Vintage Collectibles": {}
    }
  },
  "Business & Industrial": {
    "Packaging & Shipping": {
      "Boxes": {},
      "Mailers": {},
      "Tape & Seals": {},
      "Labels & Printers": {},
      "Pallets & Stretch Film": {}
    },
    "Industrial Tools": {
      "Material Handling": {},
      "Measuring & Testing": {},
      "Welding": {},
      "Cutting Tools": {},
      "Industrial Safety": {}
    },
    "Retail Store Supplies": {
      "POS Accessories": {},
      "Price Tags": {},
      "Display Fixtures": {},
      "Shopping Bags": {},
      "Barcode Scanners": {}
    },
    "Janitorial & Sanitation": {
      "Cleaning Chemicals": {},
      "Cleaning Tools": {},
      "Waste Management": {},
      "Hygiene Supplies": {}
    },
    "Food Service Equipment": {
      "Commercial Kitchen": {},
      "Serving Equipment": {},
      "Refrigeration": {},
      "Baking Equipment": {}
    }
  }
};

 
async function insertCategoryTree(tree: any, parentId: mongoose.Types.ObjectId | null = null) {
  for (const [name, children] of Object.entries(tree)) {
    // Insert category
    const category = await Category.create({
      name,
      parent: parentId,
      hasChildren: Object.keys(children as object).length > 0
    }) as ICategory;

    // Recursive call if there are subcategories
    if (Object.keys(children as object).length > 0) {
      await insertCategoryTree(children, category._id);
    }
  }
}

async function seedCategories() {
  try {
    // Connect to database first
    await connectDB();
    
    // Clear existing data
    await Category.deleteMany({});
    
    // Insert the category tree
    await insertCategoryTree(categoryTree);
    
    console.log("Categories seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding categories:", err);
    process.exit(1);
  }
}

seedCategories();