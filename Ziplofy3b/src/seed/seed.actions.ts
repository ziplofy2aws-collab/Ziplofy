import dotenv from 'dotenv';
import { connectDB } from '../config/database.config';
import { Action, ActionType } from '../models/action/action.model';

dotenv.config();

async function seedActions() {
  try {
    await connectDB();

    const actions = [
      {
        actionType: ActionType.SEND_EMAIL,
        name: 'Send Email',
        description: 'Send an email to a recipient',
      },
      {
        actionType: ActionType.SEND_SMS,
        name: 'Send SMS',
        description: 'Send an SMS to a phone number',
      },
      {
        actionType: ActionType.SEND_PUSH_NOTIFICATION,
        name: 'Send Push Notification',
        description: 'Send a push notification to a device/user',
      },
      {
        actionType: ActionType.SEND_WHATSAPP_MESSAGE,
        name: 'Send WhatsApp Message',
        description: 'Send a WhatsApp message to a recipient',
      },
    ];

    for (const a of actions) {
      await Action.updateOne({ actionType: a.actionType }, { $set: a }, { upsert: true });
    }

    // eslint-disable-next-line no-console
    console.log('Actions seeding completed:', { count: actions.length });
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error seeding actions:', err);
    process.exit(1);
  }
}

seedActions();


