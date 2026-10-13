import type { Metadata } from 'next';
import { Admin } from '@/components/draft7/pages/Admin';

export const metadata: Metadata = {
  title: 'Admin - Draft7',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <Admin />;
}
