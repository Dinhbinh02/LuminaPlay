import React from 'react';
import DetailsView from '@/components/movie/DetailsView';

export default function TVDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <DetailsView id={id} type="tv" />;
}
