import Explore from './Explore';

export default function FindMatches({
  onNavigate,
}: {
  onNavigate: (screen: string) => void;
}) {
  return <Explore onNavigate={onNavigate} />;
}
