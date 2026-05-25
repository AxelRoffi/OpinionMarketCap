/**
 * Silences the noisy console errors that wallet browser extensions throw
 * when multiple injected providers fight over `window.ethereum`. Pure
 * client-side, no wagmi imports — kept tiny so providers.tsx doesn't pull
 * a wagmi config side-effect just to mute log spam.
 */
export const suppressExtensionErrors = () => {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;

  const noisy = (message: string) =>
    message.includes('Cannot redefine property: ethereum') ||
    message.includes('chrome.runtime.sendMessage') ||
    message.includes('Extension ID') ||
    message.includes('chrome-extension://') ||
    message.includes('inpage.js') ||
    message.includes('MetaMask encountered an error setting the global Ethereum provider');

  console.error = (...args) => {
    if (noisy(args.join(' '))) return;
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    if (noisy(args.join(' '))) return;
    originalWarn.apply(console, args);
  };
};
