'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

type Tag = 'h1' | 'h2' | 'h3' | 'h4';

type RevealHeadlineProps = {
  as?: Tag;
  className?: string;
  /**
   * Children should be plain text OR a single-level array of strings/spans.
   * For mixed inline content (e.g. <span className="text-pop">), pass an array
   * of children — each item gets its own animation slot.
   */
  children: ReactNode;
  /** Stagger between words/items in seconds. Default 0.045. */
  stagger?: number;
};

/**
 * Word-stagger entrance for big display headlines.
 * Splits text by whitespace and animates each word in. Inline elements (like
 * <span className="text-pop">Get paid</span>) are treated as a single unit.
 */
export function RevealHeadline({ as = 'h2', className, children, stagger = 0.045 }: RevealHeadlineProps) {
  const Tag = motion[as];

  const items = splitChildren(children);

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: stagger }}
    >
      {items.map((it, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 28, rotate: -3 },
            visible: { opacity: 1, y: 0, rotate: 0 },
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {it}
          {/* keep spaces between word slots */}
          {typeof it === 'string' && i < items.length - 1 ? ' ' : null}
        </motion.span>
      ))}
    </Tag>
  );
}

/** Split children into animatable units: words for strings, single units for elements. */
function splitChildren(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  const walk = (node: ReactNode) => {
    if (typeof node === 'string') {
      const words = node.split(/(\s+)/).filter((w) => w.trim().length > 0);
      for (const w of words) out.push(w);
    } else if (Array.isArray(node)) {
      for (const n of node) walk(n);
    } else if (node === null || node === undefined || typeof node === 'boolean') {
      // skip
    } else {
      out.push(node);
    }
  };
  walk(children);
  return out;
}
