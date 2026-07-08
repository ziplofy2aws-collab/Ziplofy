import { Navigate, useParams } from 'react-router-dom';
import { collectionPath, productPath } from '@/utils/storefront-paths';

export function LegacyProductRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id?.trim()) return <Navigate to="/collections/all" replace />;
  return <Navigate to={productPath(id)} replace />;
}

export function LegacyCollectionRedirect() {
  const { urlHandle } = useParams<{ urlHandle: string }>();
  const handle = urlHandle?.trim() ?? '';
  if (!handle || handle.toLowerCase() === 'all') {
    return <Navigate to="/collections/all" replace />;
  }
  return <Navigate to={collectionPath(handle)} replace />;
}
