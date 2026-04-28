import { OfflineClient } from './OfflineClient';

export const metadata = {
  title: 'Offline · TAG Expo Command Center',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-tag-50">
      <OfflineClient />
    </div>
  );
}
