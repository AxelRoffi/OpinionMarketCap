import { redirect } from 'next/navigation';

// Redirect /portfolio to /profile to maintain existing functionality
// while providing a cleaner, more finance-focused URL
export default function PortfolioPage() {
  redirect('/profile');
}