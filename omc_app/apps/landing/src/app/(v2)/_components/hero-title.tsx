'use client';

import { motion, type Variants } from 'framer-motion';
import { Children, Fragment, ReactNode, isValidElement } from 'react';

type HeroTitleProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Hero H1 with **line-by-line slap-in**. Splits children at <br /> boundaries
 * and animates each line independently — slide-up + rotate-overshoot + spring,
 * staggered ~120ms. Each line feels like a sticker getting placed.
 */
export function HeroTitle({ className, children }: HeroTitleProps) {
  const lines = splitByBr(children);

  const lineVariants: Variants = {
    hidden: { opacity: 0, y: 36, rotate: -2.5, scale: 0.94 },
    visible: { opacity: 1, y: 0, rotate: 0, scale: 1 },
  };

  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.12, delayChildren: 0.05 }}
    >
      {lines.map((line, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            variants={lineVariants}
            transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.7 }}
          >
            {line}
          </motion.span>
          {i < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </motion.h1>
  );
}

/** Eyebrow line above the hero H1. Fades in from above. */
export function HeroEyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/** Sub-paragraph under the hero H1. Fades up after the title. */
export function HeroLede({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.p
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.55 }}
    >
      {children}
    </motion.p>
  );
}

/** Walk children, split into lines whenever we hit a <br />. */
function splitByBr(children: ReactNode): ReactNode[][] {
  const all = Children.toArray(children);
  const lines: ReactNode[][] = [[]];
  for (const c of all) {
    if (isValidElement(c) && c.type === 'br') {
      lines.push([]);
    } else {
      lines[lines.length - 1].push(c);
    }
  }
  return lines.filter((l) => l.length > 0);
}

/**
 * Section H2 with the same line-by-line slap-in as HeroTitle, but
 * **triggered on scroll into view** (not on page mount). Drop-in
 * replacement for the big section h2 headings.
 */
export function SectionTitle({ className, children }: HeroTitleProps) {
  const lines = splitByBr(children);

  const lineVariants: Variants = {
    hidden: { opacity: 0, y: 32, rotate: -2, scale: 0.95 },
    visible: { opacity: 1, y: 0, rotate: 0, scale: 1 },
  };

  return (
    <motion.h2
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.45 }}
      transition={{ staggerChildren: 0.11, delayChildren: 0.05 }}
    >
      {lines.map((line, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            variants={lineVariants}
            transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.7 }}
          >
            {line}
          </motion.span>
          {i < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </motion.h2>
  );
}
