import { Sala } from '@/components/draft7/Sala';

interface Props {
  params: { roomId: string };
}

export default function SalaPage({ params }: Props) {
  return <Sala roomId={params.roomId} />;
}
