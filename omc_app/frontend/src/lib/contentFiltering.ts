// Content filtering utilities for ranking opinion quality
export interface ContentScore {
  qualityScore: number; // 0-100
  reasons: string[];
  category: 'high' | 'medium' | 'low' | 'spam';
}

/**
 * Calculate text entropy to detect gibberish/random text
 */
function calculateTextEntropy(text: string): number {
  if (!text || text.length === 0) return 0;
  
  const chars = text.toLowerCase().split('');
  const freq: Record<string, number> = {};
  
  chars.forEach(char => {
    if (char.match(/[a-z]/)) { // Only count letters
      freq[char] = (freq[char] || 0) + 1;
    }
  });
  
  const total = Object.values(freq).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  
  return Object.values(freq).reduce((entropy, count) => {
    const p = count / total;
    return entropy - p * Math.log2(p);
  }, 0);
}

/**
 * Detect likely gibberish or keyboard mashing
 */
function isLikelyGibberish(text: string): boolean {
  if (!text || text.length < 5) return false;
  
  const entropy = calculateTextEntropy(text);
  const hasRepeatedChars = /(.)\1{4,}/.test(text); // 5+ repeated chars
  const randomKeyPattern = /[qwertyuiop]{4,}|[asdfghjkl]{4,}|[zxcvbnm]{4,}/i.test(text);
  const hasVowels = /[aeiouAEIOU]/.test(text);
  const onlySpecialChars = /^[^a-zA-Z0-9\s?!.,;:'"()-]+$/.test(text);
  
  // Very low entropy suggests repetitive or non-random text
  // Very high entropy with no vowels suggests random characters
  return (
    entropy < 1.5 || // Too repetitive
    (entropy > 4.0 && !hasVowels) || // Too random without vowels
    hasRepeatedChars ||
    randomKeyPattern ||
    onlySpecialChars
  );
}

/**
 * Check if text has reasonable English characteristics
 */
function hasEnglishCharacteristics(text: string): boolean {
  if (!text) return false;
  
  const hasVowels = /[aeiouAEIOU]/.test(text);
  const hasConsonants = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(text);
  const reasonableLength = text.length >= 2;
  const notAllNumbers = !/^\d+$/.test(text.trim());
  const hasSpacesOrPunctuation = /[\s.,!?;:]/.test(text) || text.length <= 10;
  
  return hasVowels && hasConsonants && reasonableLength && notAllNumbers && hasSpacesOrPunctuation;
}

/**
 * Check for common spam patterns
 */
function hasSpamCharacteristics(question: string, answer: string): boolean {
  const combined = (question + ' ' + answer).toLowerCase();
  
  // Common spam indicators
  const spamPatterns = [
    /crypto|bitcoin|money|invest|profit|earn/i, // Financial spam
    /click|link|visit|website|url/i, // Link spam
    /buy|sell|cheap|discount|offer/i, // Commercial spam
    /test|testing|asdf|qwer/i, // Test content
  ];
  
  const hasSpamWords = spamPatterns.some(pattern => pattern.test(combined));
  const isQAIdentical = question.toLowerCase().trim() === answer.toLowerCase().trim();
  const hasExcessiveSpecialChars = /[!@#$%^&*()]{3,}/.test(combined);
  
  return hasSpamWords || isQAIdentical || hasExcessiveSpecialChars;
}

/**
 * Calculate comprehensive content quality score
 */
export function scoreOpinionContent(opinion: {
  question: string;
  currentAnswer: string;
  totalVolume?: number;
  createdAt?: Date;
}): ContentScore {
  const { question, currentAnswer, totalVolume = 0 } = opinion;
  
  let score = 50; // Start neutral
  const reasons: string[] = [];
  
  // Question quality analysis
  if (!question || question.length < 2) {
    score -= 50;
    reasons.push('No question provided');
  } else {
    if (isLikelyGibberish(question)) {
      score -= 35;
      reasons.push('Question appears to be gibberish');
    } else if (!hasEnglishCharacteristics(question)) {
      score -= 20;
      reasons.push('Question has unclear language');
    } else {
      score += 15; // Bonus for clear question
    }
    
    if (!question.trim().endsWith('?')) {
      score -= 10;
      reasons.push('Question missing question mark');
    } else {
      score += 5;
    }
    
    // Question length quality
    if (question.length >= 10 && question.length <= 60) {
      score += 10; // Good length
    } else if (question.length < 5) {
      score -= 15;
      reasons.push('Question too short');
    }
  }
  
  // Answer quality analysis
  if (!currentAnswer || currentAnswer.length < 2) {
    score -= 30;
    reasons.push('No answer provided');
  } else {
    if (isLikelyGibberish(currentAnswer)) {
      score -= 25;
      reasons.push('Answer appears to be gibberish');
    } else if (!hasEnglishCharacteristics(currentAnswer)) {
      score -= 15;
      reasons.push('Answer has unclear language');
    } else {
      score += 10; // Bonus for clear answer
    }
    
    // Answer length quality
    if (currentAnswer.length >= 5 && currentAnswer.length <= 50) {
      score += 8; // Good length
    } else if (currentAnswer.length <= 3) {
      score -= 12;
      reasons.push('Answer too short');
    }
  }
  
  // Spam detection
  if (hasSpamCharacteristics(question, currentAnswer)) {
    score -= 30;
    reasons.push('Contains spam characteristics');
  }
  
  // Market activity bonus (indicates user engagement)
  if (totalVolume > 0) {
    const volumeBonus = Math.min(20, Math.log(totalVolume / 1000000) * 5); // Log scale bonus
    score += volumeBonus;
    if (volumeBonus > 0) {
      reasons.push(`Market activity bonus: ${volumeBonus.toFixed(1)} points`);
    }
  }
  
  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Categorize
  let category: ContentScore['category'];
  if (score >= 70) category = 'high';
  else if (score >= 50) category = 'medium';
  else if (score >= 25) category = 'low';
  else category = 'spam';
  
  return {
    qualityScore: score,
    reasons,
    category
  };
}

/**
 * Sort opinions by quality score (high to low)
 */
export function sortOpinionsByQuality<T extends { question: string; currentAnswer: string; totalVolume?: number }>(
  opinions: T[]
): T[] {
  return opinions.sort((a, b) => {
    const scoreA = scoreOpinionContent(a);
    const scoreB = scoreOpinionContent(b);
    return scoreB.qualityScore - scoreA.qualityScore;
  });
}

/**
 * Filter opinions by minimum quality threshold
 */
export function filterOpinionsByQuality<T extends { question: string; currentAnswer: string; totalVolume?: number }>(
  opinions: T[],
  minQualityScore: number = 25
): T[] {
  return opinions.filter(opinion => {
    const score = scoreOpinionContent(opinion);
    return score.qualityScore >= minQualityScore;
  });
}