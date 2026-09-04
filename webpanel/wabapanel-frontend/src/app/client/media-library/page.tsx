import { redirect } from 'next/navigation';

/** Legacy path — media library now lives under Online Store. */
export default function LegacyMediaLibraryRedirect() {
  redirect('/client/online-store/media-library');
}
