'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface CountdownTimerProps {
  deadline: number; // Unix timestamp
  status: 'active' | 'executed' | 'expired';
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({ 
  deadline, 
  status, 
  className = "", 
  size = "medium" 
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  const [mounted, setMounted] = useState(false);

  // Calculate time remaining
  const calculateTimeRemaining = (): TimeRemaining => {
    const now = Math.floor(Date.now() / 1000);
    const total = deadline - now;

    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    const days = Math.floor(total / (24 * 60 * 60));
    const hours = Math.floor((total % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((total % (60 * 60)) / 60);
    const seconds = Math.floor(total % 60);

    return { days, hours, minutes, seconds, total };
  };

  // Update timer every second
  useEffect(() => {
    setMounted(true);
    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return <div className={`animate-pulse bg-slate-700 rounded ${
      size === 'large' ? 'h-16' : size === 'medium' ? 'h-12' : 'h-8'
    } ${className}`} />;
  }

  // Get urgency level
  const getUrgencyLevel = () => {
    if (timeRemaining.total <= 0) return 'expired';
    if (timeRemaining.total < 3600) return 'critical'; // < 1 hour
    if (timeRemaining.total < 86400) return 'urgent'; // < 24 hours
    if (timeRemaining.total < 259200) return 'moderate'; // < 3 days
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  // Get colors based on urgency and status
  const getColors = () => {
    if (status === 'executed') {
      return {
        bg: 'bg-blue-500/10 border-blue-500/20',
        text: 'text-blue-400',
        accent: 'text-blue-300'
      };
    }
    
    if (status === 'expired' || timeRemaining.total <= 0) {
      return {
        bg: 'bg-red-500/10 border-red-500/20',
        text: 'text-red-400',
        accent: 'text-red-300'
      };
    }

    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-500/20 border-red-500/30',
          text: 'text-red-400',
          accent: 'text-red-300'
        };
      case 'urgent':
        return {
          bg: 'bg-orange-500/20 border-orange-500/30',
          text: 'text-orange-400',
          accent: 'text-orange-300'
        };
      case 'moderate':
        return {
          bg: 'bg-yellow-500/20 border-yellow-500/30',
          text: 'text-yellow-400',
          accent: 'text-yellow-300'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-400',
          accent: 'text-emerald-300'
        };
    }
  };

  const colors = getColors();

  // Get icon based on status/urgency
  const getIcon = () => {
    if (status === 'executed') return <CheckCircle className="w-5 h-5" />;
    if (status === 'expired' || timeRemaining.total <= 0) return <AlertCircle className="w-5 h-5" />;
    if (urgencyLevel === 'critical') return <Zap className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  // Get status message
  const getStatusMessage = () => {
    if (status === 'executed') return 'Pool Executed';
    if (status === 'expired' || timeRemaining.total <= 0) return 'Pool Expired';
    
    switch (urgencyLevel) {
      case 'critical': return 'ENDING SOON!';
      case 'urgent': return 'Less than 24 hours';
      case 'moderate': return 'Few days remaining';
      default: return 'Time remaining';
    }
  };

  const sizeClasses = {
    small: {
      container: 'p-3',
      title: 'text-xs',
      time: 'text-sm',
      unit: 'text-xs',
      grid: 'gap-2'
    },
    medium: {
      container: 'p-4',
      title: 'text-sm',
      time: 'text-lg',
      unit: 'text-xs',
      grid: 'gap-3'
    },
    large: {
      container: 'p-6',
      title: 'text-base',
      time: 'text-2xl',
      unit: 'text-sm',
      grid: 'gap-4'
    }
  };

  const classes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${colors.bg} border rounded-lg ${classes.container} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={colors.text}>
            {getIcon()}
          </div>
          <span className={`${classes.title} font-medium text-white`}>
            {getStatusMessage()}
          </span>
        </div>
        
        {urgencyLevel === 'critical' && timeRemaining.total > 0 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-red-400 text-xs font-bold"
          >
            URGENT
          </motion.div>
        )}
      </div>

      {/* Timer Display */}
      <AnimatePresence mode="wait">
        {timeRemaining.total > 0 ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`grid grid-cols-4 ${classes.grid} text-center`}
          >
            {/* Days */}
            <div>
              <motion.div
                key={timeRemaining.days}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${classes.time} font-bold ${colors.text}`}
              >
                {timeRemaining.days.toString().padStart(2, '0')}
              </motion.div>
              <div className={`${classes.unit} ${colors.accent}`}>Days</div>
            </div>

            {/* Hours */}
            <div>
              <motion.div
                key={timeRemaining.hours}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${classes.time} font-bold ${colors.text}`}
              >
                {timeRemaining.hours.toString().padStart(2, '0')}
              </motion.div>
              <div className={`${classes.unit} ${colors.accent}`}>Hours</div>
            </div>

            {/* Minutes */}
            <div>
              <motion.div
                key={timeRemaining.minutes}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${classes.time} font-bold ${colors.text}`}
              >
                {timeRemaining.minutes.toString().padStart(2, '0')}
              </motion.div>
              <div className={`${classes.unit} ${colors.accent}`}>Minutes</div>
            </div>

            {/* Seconds */}
            <div>
              <motion.div
                key={timeRemaining.seconds}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${classes.time} font-bold ${colors.text}`}
              >
                {timeRemaining.seconds.toString().padStart(2, '0')}
              </motion.div>
              <div className={`${classes.unit} ${colors.accent}`}>Seconds</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-4"
          >
            <div className={`${classes.time} font-bold ${colors.text}`}>
              {status === 'executed' ? '✅ COMPLETED' : '⏰ EXPIRED'}
            </div>
            <div className={`${classes.unit} ${colors.accent} mt-1`}>
              {status === 'executed' ? 'Pool has been executed' : 'Deadline has passed'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar for Critical Timing */}
      {urgencyLevel === 'critical' && timeRemaining.total > 0 && (
        <div className="mt-3">
          <div className="w-full bg-red-900/30 rounded-full h-1">
            <motion.div 
              className="bg-red-500 h-1 rounded-full"
              animate={{ 
                width: [`${(timeRemaining.seconds / 60) * 100}%`, '0%'] 
              }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}