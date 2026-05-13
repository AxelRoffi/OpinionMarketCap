import { redirect } from 'next/navigation';

/**
 * /profile has no concrete identity yet — until wallet connect lands in /v2,
 * the BottomTabBar "ME" tab routes here and we send users to the "me" sentinel.
 */
export default function ProfileRedirect() {
  redirect('/profile/me');
}
