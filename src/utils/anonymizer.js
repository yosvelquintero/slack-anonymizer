import { createHash } from 'crypto';

/**
 * Hashes a user ID to create a consistent, anonymous identifier.
 * Uses SHA-256 for a robust, one-way hash.
 * @param {string} userId - The original user ID (e.g., 'U0A1B2C3D').
 * @returns {string} A hashed, anonymous user identifier (e.g., 'user_a1b2c3d4').
 */
const hashUserId = (userId) => {
  const hash = createHash('sha256');
  hash.update(userId);
  // We take a slice of the hash for a shorter, cleaner ID.
  return `user_${hash.digest('hex').slice(0, 8)}`;
};

/**
 * Anonymizes potentially sensitive information in message text.
 * Replaces emails, phone numbers, URLs, IP addresses, credit cards, SSNs, and other sensitive data.
 * @param {string} text - The original message text.
 * @returns {string} Anonymized message text with sensitive information replaced with placeholders.
 */
const anonymizeText = (text) => {
  // Replace email addresses
  let anonymized = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');

  // Replace phone numbers (various formats)
  anonymized = anonymized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
  anonymized = anonymized.replace(/\(\d{3}\)\s*\d{3}[-.]?\d{4}/g, '[PHONE]');
  anonymized = anonymized.replace(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g, '[PHONE]');

  // Replace URLs
  anonymized = anonymized.replace(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
    '[URL]'
  );

  // Replace IP addresses
  anonymized = anonymized.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[IP_ADDRESS]');

  // Replace credit card numbers (full and partial)
  anonymized = anonymized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CREDIT_CARD]');
  anonymized = anonymized.replace(/\bending in \d{4}\b/g, '[CREDIT_CARD_PARTIAL]');

  // Replace SSNs
  anonymized = anonymized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');

  // Replace account numbers
  anonymized = anonymized.replace(/\bAccount \d{10,}\b/g, '[ACCOUNT_NUMBER]');

  // Replace transaction IDs
  anonymized = anonymized.replace(/\b[A-Z]{3}-\d{4}-\d{6}\b/g, '[TRANSACTION_ID]');

  // Replace SSH keys (partial)
  anonymized = anonymized.replace(/ssh-rsa\s+[A-Za-z0-9+/=]+/g, '[SSH_KEY]');

  // Replace server names and internal domains
  anonymized = anonymized.replace(/\b[\w-]+\.[\w-]+\.company\.com\b/g, '[INTERNAL_SERVER]');

  // Replace monetary amounts over $1000
  anonymized = anonymized.replace(/\$\d{1,3}(,\d{3})+/g, '[AMOUNT]');

  return anonymized;
};

/**
 * Anonymizes a single Slack message object.
 * Preserves timestamp and channel while anonymizing user data and message content.
 * @param {Object} message - The original message object containing ts, user, username, channel, text, and reactions.
 * @returns {Object} An anonymized message object with sensitive information replaced.
 */
export const anonymizeMessage = (message) => {
  return {
    ts: message.ts,
    user: hashUserId(message.user),
    username: '[USERNAME]', // Redact the username completely
    channel: message.channel,
    text: anonymizeText(message.text),
    reactions: message.reactions || [],
    anonymized: true,
  };
};

/**
 * Anonymizes an array of Slack messages.
 * Applies anonymization to each message in the array while preserving order.
 * @param {Array<Object>} messages - An array of original message objects.
 * @returns {Array<Object>} An array of anonymized message objects.
 */
export const anonymizeMessages = (messages) => {
  return messages.map(anonymizeMessage);
};

/**
 * Creates a mapping of original users to anonymous usernames.
 * Generates consistent anonymous identifiers for each unique user in the message set.
 * @param {Array<Object>} messages - Array of message objects containing user properties.
 * @returns {Object} Mapping of original user IDs to anonymous usernames.
 */
export const createUserMapping = (messages) => {
  const userMapping = {};

  messages.forEach((message) => {
    if (!userMapping[message.user]) {
      userMapping[message.user] = hashUserId(message.user);
    }
  });

  return userMapping;
};
