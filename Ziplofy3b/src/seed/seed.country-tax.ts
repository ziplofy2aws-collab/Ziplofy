import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.config';
import { Country } from '../models/country/country.model';
import { CountryTax } from '../models/country-tax/country-tax.model';

dotenv.config();

async function seedCountryTax() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Resolve India dynamically from Country seed data.
    const india = await Country.findOne({ iso2: 'IN' }).select('_id').lean();
    if (!india?._id) {
      console.log('India country not found (iso2=IN). Please run seed:countries first.');
      process.exit(0);
    }
    const indiaObjectId = new mongoose.Types.ObjectId(String(india._id));

    // Create or update country tax for India
    console.log('Creating/updating country tax for India...');
    
    const countryTax = await CountryTax.findOneAndUpdate(
      {
        countryId: indiaObjectId,
      },
      {
        $set: {
          countryId: indiaObjectId,
          taxRate: 9,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log('\n✅ Country tax seeded successfully!');
    console.log(`  - Country ID: ${countryTax.countryId.toString()}`);
    console.log(`  - Tax Rate: ${countryTax.taxRate}%`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding country tax:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCountryTax();

