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
 * Note: crypto/bitcoin are legitimate topics for this platform, so not flagged
 */
function hasSpamCharacteristics(question: string, answer: string): boolean {
  const combined = (question + ' ' + answer).toLowerCase();

  // Common spam indicators (NOT including crypto terms since this is a crypto platform)
  const spamPatterns = [
    /click here|visit my|check out my/i, // Link spam
    /free money|get rich|guaranteed profit/i, // Scam language
    /\btest\b|\btesting\b|asdf|qwer|zxcv/i, // Test content
    /lorem ipsum/i, // Placeholder text
  ];

  const hasSpamWords = spamPatterns.some(pattern => pattern.test(combined));
  const isQAIdentical = question.toLowerCase().trim() === answer.toLowerCase().trim();
  const hasExcessiveSpecialChars = /[!@#$%^&*()]{3,}/.test(combined);

  return hasSpamWords || isQAIdentical || hasExcessiveSpecialChars;
}

/**
 * Validate answer only (for trading modal when submitting a new answer)
 * This should be used BEFORE allowing a trade transaction to proceed
 */
export function validateAnswerForTrading(
  answer: string,
  description?: string
): { valid: boolean; error?: string; warning?: string } {
  // Check for empty/too short
  if (!answer || answer.trim().length < 2) {
    return { valid: false, error: 'Answer is too short (minimum 2 characters)' };
  }

  // Check for gibberish
  if (isLikelyGibberish(answer)) {
    return { valid: false, error: 'Answer appears to be gibberish or random characters. Please enter a meaningful answer.' };
  }

  // Check for all-caps shouting
  const answerUpperRatio = (answer.match(/[A-Z]/g) || []).length / answer.length;
  if (answerUpperRatio > 0.7 && answer.length > 10) {
    return { valid: false, error: 'Please don\'t use ALL CAPS for your answer.' };
  }

  // Check for excessive repetition
  if (/(.)\1{5,}/.test(answer)) {
    return { valid: false, error: 'Answer contains excessive character repetition.' };
  }

  // Check for number-only content
  if (/^\d+$/.test(answer.trim())) {
    return { valid: false, error: 'Answer cannot be numbers only.' };
  }

  // Check for test/spam patterns
  const spamPatterns = [
    /^test$/i,
    /^testing$/i,
    /^asdf/i,
    /^qwer/i,
    /^zxcv/i,
    /^aaa+$/i,
    /^bbb+$/i,
    /^xxx+$/i,
    /lorem ipsum/i,
  ];
  if (spamPatterns.some(pattern => pattern.test(answer.trim()))) {
    return { valid: false, error: 'Answer appears to be test content. Please enter a genuine answer.' };
  }

  // Check description if provided
  if (description && description.trim().length > 0) {
    if (isLikelyGibberish(description)) {
      return { valid: false, error: 'Description appears to be gibberish. Please enter meaningful content or leave it empty.' };
    }
    const descUpperRatio = (description.match(/[A-Z]/g) || []).length / description.length;
    if (descUpperRatio > 0.7 && description.length > 15) {
      return { valid: false, error: 'Please don\'t use ALL CAPS for your description.' };
    }
  }

  // Soft warning for very short answers
  if (answer.trim().length <= 3) {
    return {
      valid: true,
      warning: 'Very short answers may be less compelling to other users.'
    };
  }

  return { valid: true };
}

/**
 * Validate content before submission - returns rejection reason or null if valid
 * This should be used BEFORE allowing a transaction to proceed
 */
export function validateContentForSubmission(
  question: string,
  answer: string
): { valid: boolean; error?: string; warning?: string } {
  // Check for empty/too short
  if (!question || question.trim().length < 5) {
    return { valid: false, error: 'Question is too short (minimum 5 characters)' };
  }
  if (!answer || answer.trim().length < 2) {
    return { valid: false, error: 'Answer is too short (minimum 2 characters)' };
  }

  // Check for gibberish
  if (isLikelyGibberish(question)) {
    return { valid: false, error: 'Question appears to be gibberish or random characters. Please enter a meaningful question.' };
  }
  if (isLikelyGibberish(answer)) {
    return { valid: false, error: 'Answer appears to be gibberish or random characters. Please enter a meaningful answer.' };
  }

  // Check for spam patterns
  if (hasSpamCharacteristics(question, answer)) {
    return { valid: false, error: 'Content contains spam patterns. Please write genuine content.' };
  }

  // Check for all-caps shouting
  const questionUpperRatio = (question.match(/[A-Z]/g) || []).length / question.length;
  const answerUpperRatio = (answer.match(/[A-Z]/g) || []).length / answer.length;
  if (questionUpperRatio > 0.7 && question.length > 10) {
    return { valid: false, error: 'Please don\'t use ALL CAPS for your question.' };
  }
  if (answerUpperRatio > 0.7 && answer.length > 10) {
    return { valid: false, error: 'Please don\'t use ALL CAPS for your answer.' };
  }

  // Check for excessive repetition
  if (/(.)\1{5,}/.test(question) || /(.)\1{5,}/.test(answer)) {
    return { valid: false, error: 'Content contains excessive character repetition.' };
  }

  // Check for number-only content
  if (/^\d+$/.test(question.trim()) || /^\d+$/.test(answer.trim())) {
    return { valid: false, error: 'Content cannot be numbers only.' };
  }

  // Soft warning for low quality (but still allowed)
  const score = scoreOpinionContent({ question, currentAnswer: answer });
  if (score.qualityScore < 40) {
    return {
      valid: true,
      warning: 'Your content may be ranked lower due to quality. Consider improving clarity.'
    };
  }

  return { valid: true };
}

/**
 * Calculate comprehensive content quality score
 */
export function scoreOpinionContent(opinion: {
  question: string;
  currentAnswer: string;
  totalVolume?: number | bigint;
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
    // Convert bigint to number for calculation
    const volumeNumber = typeof totalVolume === 'bigint' ? Number(totalVolume) : totalVolume;
    const volumeBonus = Math.min(20, Math.log(volumeNumber / 1000000) * 5); // Log scale bonus
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
export function sortOpinionsByQuality<T extends { question: string; currentAnswer: string; totalVolume?: number | bigint }>(
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
export function filterOpinionsByQuality<T extends { question: string; currentAnswer: string; totalVolume?: number | bigint }>(
  opinions: T[],
  minQualityScore: number = 25
): T[] {
  return opinions.filter(opinion => {
    const score = scoreOpinionContent(opinion);
    return score.qualityScore >= minQualityScore;
  });
}