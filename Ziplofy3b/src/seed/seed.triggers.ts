  import dotenv from 'dotenv';
import { connectDB } from '../config/database.config';
import { Trigger } from '../models/trigger/trigger.model';
import { TriggerKey } from '../models/automation/automation-flow.model';

dotenv.config();

async function seedTriggers() {
  try {
    await connectDB();

    const payload = {
      key: TriggerKey.ADD_TO_CART,
      name: 'Add to cart',
      description: '',
      hasConditions: true,
      exposedVariables: [
        {
          path: 'cart.quantity',
          label: 'Quantity',
          type: 'number',
          description: 'Number of items currently in the cart',
        },
      ],
    };

    const res = await Trigger.updateOne(
      { key: payload.key },
      { $set: payload },
      { upsert: true }
    );

    // eslint-disable-next-line no-console
    console.log('Triggers seeding completed:', {
      acknowledged: res.acknowledged,
      upsertedId: (res as any).upsertedId,
      matchedCount: res.matchedCount,
      modifiedCount: res.modifiedCount,
    });

    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error seeding triggers:', err);
    process.exit(1);
  }
}

seedTriggers();


