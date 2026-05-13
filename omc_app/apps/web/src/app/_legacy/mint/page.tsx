import { redirect } from 'next/navigation';

// Redirect /mint to /create to maintain existing functionality
// while providing a cleaner, more Web3-native URL
export default function MintPage() {
  redirect('/create');
}