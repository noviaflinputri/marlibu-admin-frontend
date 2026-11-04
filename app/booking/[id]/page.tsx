import DetailBookingView from './components/detail-booking-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailBookingPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <DetailBookingView id={resolvedParams.id} />;
}