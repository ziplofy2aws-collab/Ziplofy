import dotenv from 'dotenv';
import { connectDB } from '../../config/database.config';
import { NotificationCategory } from '../../models/notification-category/notification-category.model';

dotenv.config();

const categories = [
  {
    name: 'Customer notifications',
    description: 'Notify customers about order and account events',
  },
  {
    name: 'Staff notifications',
    description: 'Notify staff members about new order events',
  },
  {
    name: 'Fulfillment request notification',
    description: 'Notify your fulfillment service provider when you mark an order as fulfilled',
  },
];

async function seedNotificationCategories() {
  try {
    await connectDB();

    for (const category of categories) {
      await NotificationCategory.updateOne(
        { name: category.name },
        { $set: category },
        { upsert: true }
      );
    }

    console.log('Notification categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notification categories:', error);
    process.exit(1);
  }
}

seedNotificationCategories();

  