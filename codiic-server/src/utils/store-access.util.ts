import { SecureUserInfo } from '../middlewares/auth.middleware';
import { Store } from '../models/store/store.model';
import { CustomError } from './error.utils';

export async function assertStoreAccess(storeId: string, user: SecureUserInfo | undefined): Promise<void> {
  if (!user) {
    throw new CustomError('Not authorized to access this route', 401);
  }

  if (user.superAdmin) {
    return;
  }

  const store = await Store.findById(storeId).select('userId').lean();
  if (!store) {
    throw new CustomError('Store not found', 404);
  }

  if (store.userId.toString() !== user.id) {
    throw new CustomError('You do not have permission to manage this store', 403);
  }
}

export function assertStoreContentFileKey(storeId: string, key: string): void {
  const expectedPrefix = `stores/${storeId}/content-files/`;
  if (!key.startsWith(expectedPrefix)) {
    throw new CustomError('Invalid file key for this store', 400);
  }
}
