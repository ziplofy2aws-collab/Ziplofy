import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.config';
import { Country } from '../models/country/country.model';
import { TaxDefault } from '../models/tax-rate-default/tax-rate-default.model';
import { State } from '../models/state/state.model';

dotenv.config();

async function seedIndiaTaxDefaults() {
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

    // Fetch all states for India
    const states = await State.find({ countryId: indiaObjectId }).lean();
    
    if (!states || states.length === 0) {
      console.log('No states found for India. Please seed states first.');
      process.exit(0);
    }

    console.log(`Found ${states.length} states for India`);

    // Prepare bulk operations for tax defaults
    const taxDefaultOps = states.map((state) => ({
      updateOne: {
        filter: {
          countryId: indiaObjectId,
          stateId: state._id,
        },
        update: {
          $set: {
            countryId: indiaObjectId,
            stateId: state._id,
            taxLabel: 'IGST',
            taxRate: 18,
            calculationMethod: 'instead',
          },
        },
        upsert: true,
      },
    }));

    // Execute bulk write
    console.log('Creating/updating tax defaults for Indian states...');
    const result = await TaxDefault.bulkWrite(taxDefaultOps as any, { ordered: false });

    console.log('\nTax Defaults Seeding Results:');
    console.log(`  - Matched: ${result.matchedCount}`);
    console.log(`  - Modified: ${result.modifiedCount}`);
    console.log(`  - Upserted: ${result.upsertedCount}`);
    console.log(`  - Total states processed: ${states.length}`);

    // Also create federal/country-level default (stateId = null)
    const federalDefault = await TaxDefault.findOneAndUpdate(
      {
        countryId: indiaObjectId,
        stateId: null,
      },
      {
        $set: {
          countryId: indiaObjectId,
          stateId: null,
          taxLabel: 'Federal GST',
          taxRate: 9,
          calculationMethod: null,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log(`\nFederal tax default ${federalDefault ? 'created/updated' : 'failed'}`);

    console.log('\n✅ India tax defaults seeding completed successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding India tax defaults:', error);
    process.exit(1);
  }
}

// Run the seed function
seedIndiaTaxDefaults();

