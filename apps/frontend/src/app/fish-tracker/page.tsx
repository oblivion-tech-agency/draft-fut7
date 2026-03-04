import { Metadata } from 'next';
import FishTrackerApp from '@/components/fish-tracker/FishTrackerApp';

export const metadata: Metadata = {
  title: 'Control de Pescados',
  description: 'Controla tus ventas y compras de pescado facilmente',
};

export default function FishTrackerPage() {
  return <FishTrackerApp />;
}
