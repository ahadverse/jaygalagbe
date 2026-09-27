import { PlaceholderScreen } from '../../components/placeholder-screen';
import { getSectorOption } from '../../features/ads/sectors';
import type { HomeStackScreenProps } from '../../navigation/types';

export function SectorListingScreen({
  route,
}: HomeStackScreenProps<'SectorListing'>) {
  const { sector, location } = route.params;
  const label = getSectorOption(sector).label;

  return (
    <PlaceholderScreen
      title={label}
      note={
        location
          ? `Search & filters for "${location}" land here.`
          : 'Search & filters land here.'
      }
    />
  );
}
