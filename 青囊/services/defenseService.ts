/**
 * Defense Service
 * Handles PII redaction (Privacy) and Injection Detection (Adversarial Defense)
 */

// Regex patterns for PII (China context)
const PHONE_REGEX = /(?:\+?86)?1[3-9]\d{9}/g;
const ID_CARD_REGEX = /\d{17}[\dX]|\d{15}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Adversarial patterns (Jailbreak attempts, prompt injection)
const ADVERSARIAL_PATTERNS = [
  /ignore previous instructions/i,
  /ignore all instructions/i,
  /system prompt/i,
  /you are not a tcm expert/i,
  /act as a hacker/i,
  /bypass safety/i,
  /dan mode/i
];

export class DefenseMechanism {
  
  /**
   * Redacts Personally Identifiable Information from text.
   */
  static sanitizePII(text: string): { sanitizedText: string; redacted: boolean } {
    let sanitizedText = text;
    let redacted = false;

    if (PHONE_REGEX.test(sanitizedText)) {
      sanitizedText = sanitizedText.replace(PHONE_REGEX, '[隐私-手机号屏蔽]');
      redacted = true;
    }
    if (ID_CARD_REGEX.test(sanitizedText)) {
      sanitizedText = sanitizedText.replace(ID_CARD_REGEX, '[隐私-身份证屏蔽]');
      redacted = true;
    }
    if (EMAIL_REGEX.test(sanitizedText)) {
      sanitizedText = sanitizedText.replace(EMAIL_REGEX, '[隐私-邮箱屏蔽]');
      redacted = true;
    }

    return { sanitizedText, redacted };
  }

  /**
   * Checks for malicious input patterns.
   */
  static detectAdversarialAttack(text: string): boolean {
    return ADVERSARIAL_PATTERNS.some(pattern => pattern.test(text));
  }
}