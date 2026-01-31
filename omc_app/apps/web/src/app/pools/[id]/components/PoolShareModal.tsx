'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  Share2,
  Music,
  Users,
  Smartphone
} from 'lucide-react';
import { DetailedPoolInfo } from '@/hooks/usePoolDetails';

interface PoolShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolDetails: DetailedPoolInfo;
}

// Social media platform configurations
const SOCIAL_PLATFORMS = [
  {
    name: 'Twitter/X',
    icon: MessageCircle,
    color: 'text-blue-400 border-blue-500 hover:bg-blue-500',
    url: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  },
  {
    name: 'TikTok',
    icon: Music,
    color: 'text-pink-500 border-pink-500 hover:bg-pink-500',
    url: (text: string, url: string) =>
      `https://www.tiktok.com/share?url=${encodeURIComponent(url)}&desc=${encodeURIComponent(text)}`
  },
  {
    name: 'Facebook',
    icon: Users,
    color: 'text-blue-600 border-blue-600 hover:bg-blue-600',
    url: (text: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  },
  {
    name: 'LinkedIn',
    icon: Users,
    color: 'text-blue-700 border-blue-700 hover:bg-blue-700',
    url: (text: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
  },
  {
    name: 'Reddit',
    icon: MessageCircle,
    color: 'text-orange-500 border-orange-500 hover:bg-orange-500',
    url: (text: string, url: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-500 border-green-500 hover:bg-green-500',
    url: (text: string, url: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
  },
  {
    name: 'Telegram',
    icon: Smartphone,
    color: 'text-blue-500 border-blue-500 hover:bg-blue-500',
    url: (text: string, url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  {
    name: 'Discord',
    icon: MessageCircle,
    color: 'text-indigo-500 border-indigo-500 hover:bg-indigo-500',
    url: (text: string, url: string) =>
      `https://discord.com/channels/@me?message=${encodeURIComponent(`${text} ${url}`)}`
  }
];

export function PoolShareModal({ isOpen, onClose, poolDetails }: PoolShareModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const poolUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pools/${poolDetails.id}`
    : `/pools/${poolDetails.id}`;

  // Custom pool sharing message as requested
  const shareText = `Hey! I created a pool on OpinionMarketCap for the question: "${poolDetails.opinionQuestion}"\n\nMy proposed answer: "${poolDetails.proposedAnswer}"\n\nJoin the pool and let's make money together! Only $${poolDetails.remainingAmount} USDC left to reach target.`;

  // Shorter version for Twitter
  const shortShareText = `Hey! I created a pool on @OpinionMktCap for: "${poolDetails.opinionQuestion}"\n\nJoin & let's make money together! Only $${poolDetails.remainingAmount} left.`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(poolUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handlePlatformShare = (platform: typeof SOCIAL_PLATFORMS[0]) => {
    const text = platform.name === 'Twitter/X' ? shortShareText : shareText;
    const url = platform.url(text, poolUrl);
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Pool: ${poolDetails.name}`,
          text: shareText,
          url: poolUrl,
        });
      } catch (error) {
        console.error('Native sharing failed:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Share Pool</h3>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Pool Preview */}
              <div className="bg-slate-900 rounded-lg p-4 mb-6">
                <div className="text-emerald-400 text-xs font-medium mb-2">Pool #{poolDetails.id}</div>
                <h4 className="font-semibold text-white mb-2 line-clamp-2">
                  {poolDetails.opinionQuestion}
                </h4>
                <p className="text-gray-300 text-sm mb-2 italic line-clamp-1">
                  Target: "{poolDetails.proposedAnswer}"
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress:</span>
                  <span className="text-emerald-400 font-medium">
                    {poolDetails.progressPercentage.toFixed(1)}% (${poolDetails.currentAmount} / ${poolDetails.targetAmount})
                  </span>
                </div>
              </div>

              {/* Invite Message Preview */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <div className="text-xs text-emerald-400 font-medium mb-2">Preview Message:</div>
                <p className="text-gray-300 text-sm italic">
                  "Hey! I created a pool on OpinionMarketCap... Join & let's make money together!"
                </p>
              </div>

              {/* Social Media Platforms */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Share on social media</h4>
                <div className="grid grid-cols-2 gap-2">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <Button
                        key={platform.name}
                        onClick={() => handlePlatformShare(platform)}
                        variant="outline"
                        className={`${platform.color} hover:text-white transition-colors duration-200 justify-start`}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {platform.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Native Share (Mobile) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <div className="mb-6">
                  <Button
                    onClick={handleNativeShare}
                    variant="outline"
                    className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Share via Device
                  </Button>
                </div>
              )}

              {/* Copy Link */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Copy direct link</h4>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-900 rounded px-3 py-2 text-sm text-gray-300 font-mono truncate">
                    {poolUrl}
                  </div>
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    size="sm"
                    className={copiedUrl ? 'border-green-500 text-green-400' : 'border-slate-500 text-gray-300 hover:text-white'}
                  >
                    {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
