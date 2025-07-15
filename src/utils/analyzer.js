import { stopWords } from './stopwords.js';

/**
 * Calculates basic statistics for a set of messages.
 * @param {Array<Object>} messages - An array of message objects.
 * @returns {Object} An object containing statistics including total messages, average length, and top words.
 */
export const calculateStatistics = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      totalMessages: 0,
      averageMessageLength: 0,
      topWords: [],
    };
  }

  const totalMessages = messages.length;
  const totalLength = messages.reduce((sum, msg) => sum + msg.text.length, 0);
  const averageMessageLength = totalLength / totalMessages;

  // Word frequency analysis
  const wordCounts = {};
  const allText = messages.map((msg) => msg.text).join(' ');
  const words = allText.toLowerCase().match(/\b(\w+)\b/g) || [];

  for (const word of words) {
    if (!stopWords.has(word) && word.length > 2) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  const topWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  return {
    totalMessages,
    averageMessageLength: parseFloat(averageMessageLength.toFixed(2)),
    topWords,
  };
};

/**
 * Performs a simple sentiment analysis on message text.
 * Uses predefined positive and negative word lists to determine sentiment.
 * @param {string} text - The text to analyze.
 * @returns {string} 'positive', 'negative', or 'neutral'.
 */
const getSentiment = (text) => {
  const positiveWords = [
    'great',
    'smoothly',
    'hard work',
    'love',
    'amazing',
    'excellent',
    'fantastic',
    'ready',
    'good',
    'thanks',
    'wonderful',
  ];
  const negativeWords = [
    'issue',
    'disappointing',
    '401 error',
    'problem',
    'critical',
    'bug',
    'urgent',
    'error',
    'issues',
    'help',
  ];
  const lowerText = text.toLowerCase();

  let score = 0;
  for (const word of positiveWords) {
    if (lowerText.includes(word)) score++;
  }
  for (const word of negativeWords) {
    if (lowerText.includes(word)) score--;
  }

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};

/**
 * Performs detailed sentiment analysis on message text with confidence scoring.
 * Uses predefined positive and negative word lists to determine sentiment and confidence.
 * @param {string} text - The text to analyze.
 * @returns {Object} Object containing sentiment, score, and confidence.
 */
const getSentimentWithConfidence = (text) => {
  const positiveWords = [
    'great',
    'smoothly',
    'hard work',
    'love',
    'amazing',
    'excellent',
    'fantastic',
    'ready',
    'good',
    'thanks',
    'wonderful',
  ];
  const negativeWords = [
    'issue',
    'disappointing',
    '401 error',
    'problem',
    'critical',
    'bug',
    'urgent',
    'error',
    'issues',
    'help',
  ];
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).length;

  let score = 0;
  let matchedWords = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) {
      score++;
      matchedWords++;
    }
  }
  for (const word of negativeWords) {
    if (lowerText.includes(word)) {
      score--;
      matchedWords++;
    }
  }

  // Calculate confidence based on:
  // 1. Number of sentiment words found relative to total words
  // 2. Absolute score strength
  // 3. Minimum confidence for neutral messages with no sentiment words

  let confidence;
  if (matchedWords === 0) {
    // No sentiment words found - low confidence neutral
    confidence = 0.3;
  } else {
    // Base confidence on word density and score strength
    const wordDensity = matchedWords / words;
    const scoreStrength = Math.abs(score) / matchedWords;
    confidence = Math.min(0.5 + wordDensity * 0.3 + scoreStrength * 0.2, 0.95);
  }

  let sentiment;
  if (score > 0) sentiment = 'positive';
  else if (score < 0) sentiment = 'negative';
  else sentiment = 'neutral';

  return {
    sentiment,
    score,
    confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
  };
};

/**
 * Generates a summary of sentiment across all messages.
 * @param {Array<Object>} messages - An array of message objects.
 * @returns {Object} An object with counts for each sentiment type (positive, negative, neutral).
 */
export const getSentimentSummary = (messages) => {
  const summary = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  for (const message of messages) {
    const sentiment = getSentiment(message.text);
    summary[sentiment]++;
  }

  return summary;
};

/**
 * Analyzes messages and returns comprehensive statistics - legacy function for compatibility.
 * Provides detailed analysis including user stats, channel stats, time stats, keywords, and sentiment overview.
 * @param {Array<Object>} messages - Array of message objects with ts, user, channel, text, and reactions properties.
 * @returns {Object} Analysis results with comprehensive statistics and insights.
 */
export const analyzeMessages = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      totalMessages: 0,
      averageLength: 0,
      userStats: {},
      channelStats: {},
      timeStats: {},
      keywords: [],
      sentimentOverview: {
        positive: 0,
        negative: 0,
        neutral: 0,
      },
    };
  }

  const userStats = {};
  const channelStats = {};
  const timeStats = {};
  const allText = [];
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };

  let totalLength = 0;

  messages.forEach((message) => {
    // User statistics
    if (!userStats[message.user]) {
      userStats[message.user] = {
        messageCount: 0,
        totalReactions: 0,
        averageLength: 0,
        totalLength: 0,
      };
    }
    userStats[message.user].messageCount++;
    userStats[message.user].totalLength += message.text.length;
    userStats[message.user].totalReactions +=
      message.reactions?.reduce((sum, reaction) => sum + reaction.count, 0) || 0;

    // Channel statistics
    if (!channelStats[message.channel]) {
      channelStats[message.channel] = {
        messageCount: 0,
        totalReactions: 0,
        uniqueUsers: new Set(),
      };
    }
    channelStats[message.channel].messageCount++;
    channelStats[message.channel].totalReactions +=
      message.reactions?.reduce((sum, reaction) => sum + reaction.count, 0) || 0;
    channelStats[message.channel].uniqueUsers.add(message.user);

    // Time statistics - use timestamp from ts field
    const timestamp = new Date(parseFloat(message.ts) * 1000);
    const hour = timestamp.getHours();
    const hourKey = `${hour}:00`;
    timeStats[hourKey] = (timeStats[hourKey] || 0) + 1;

    // Collect text for keyword analysis
    allText.push(message.text);
    totalLength += message.text.length;

    // Sentiment analysis
    const sentiment = getSentiment(message.text);
    sentimentCounts[sentiment]++;
  });

  // Calculate average lengths for users
  Object.keys(userStats).forEach((user) => {
    userStats[user].averageLength = userStats[user].totalLength / userStats[user].messageCount;
  });

  // Convert channel unique users Set to count
  Object.keys(channelStats).forEach((channel) => {
    channelStats[channel].uniqueUsers = channelStats[channel].uniqueUsers.size;
  });

  // Extract keywords from all messages
  const combinedText = allText.join(' ');
  const keywords = extractKeywords(combinedText, 15);

  return {
    totalMessages: messages.length,
    averageLength: totalLength / messages.length,
    userStats,
    channelStats,
    timeStats,
    keywords,
    sentimentOverview: sentimentCounts,
    mostActiveUser: Object.entries(userStats).reduce(
      (max, [user, stats]) => (stats.messageCount > max.count ? { user, count: stats.messageCount } : max),
      { user: null, count: 0 }
    ),
    mostActiveChannel: Object.entries(channelStats).reduce(
      (max, [channel, stats]) => (stats.messageCount > max.count ? { channel, count: stats.messageCount } : max),
      { channel: null, count: 0 }
    ),
  };
};

/**
 * Extracts keywords from text by analyzing word frequency.
 * Filters out stop words and words shorter than 3 characters.
 * @param {string} text - Text to extract keywords from.
 * @param {number} limit - Maximum number of keywords to return (default: 10).
 * @returns {Array<Object>} Array of keyword objects with word and count properties.
 */
const extractKeywords = (text, limit = 10) => {
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  const frequency = {};

  words.forEach((word) => {
    if (!stopWords.has(word) && word.length > 2) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};

/**
 * Provides detailed sentiment analysis for all messages - legacy function for compatibility.
 * Analyzes sentiment by user, channel, and timeline, providing comprehensive insights.
 * @param {Array<Object>} messages - Array of message objects with ts, user, channel, and text properties.
 * @returns {Object} Detailed sentiment analysis with overall stats, breakdown by user/channel, timeline, and message details.
 */
export const getSentimentStats = (messages) => {
  if (!messages || messages.length === 0) {
    return {
      overall: { positive: 0, negative: 0, neutral: 0 },
      byUser: {},
      byChannel: {},
      timeline: [],
      details: [],
    };
  }

  const overall = { positive: 0, negative: 0, neutral: 0 };
  const byUser = {};
  const byChannel = {};
  const details = [];

  messages.forEach((message) => {
    const sentimentResult = getSentimentWithConfidence(message.text);
    const sentiment = sentimentResult.sentiment;

    // Overall sentiment
    overall[sentiment]++;

    // By user
    if (!byUser[message.user]) {
      byUser[message.user] = { positive: 0, negative: 0, neutral: 0 };
    }
    byUser[message.user][sentiment]++;

    // By channel
    if (!byChannel[message.channel]) {
      byChannel[message.channel] = { positive: 0, negative: 0, neutral: 0 };
    }
    byChannel[message.channel][sentiment]++;

    // Details
    details.push({
      ts: message.ts,
      user: message.user,
      channel: message.channel,
      text: message.text.substring(0, 100) + (message.text.length > 100 ? '...' : ''),
      sentiment: sentiment,
      score: sentimentResult.score,
      confidence: sentimentResult.confidence,
    });
  });

  // Create timeline data (by hour)
  const timeline = {};
  messages.forEach((message) => {
    const timestamp = new Date(parseFloat(message.ts) * 1000);
    const hour = timestamp.getHours();
    const hourKey = `${hour}:00`;

    if (!timeline[hourKey]) {
      timeline[hourKey] = { positive: 0, negative: 0, neutral: 0 };
    }

    const sentimentResult = getSentimentWithConfidence(message.text);
    timeline[hourKey][sentimentResult.sentiment]++;
  });

  return {
    overall,
    byUser,
    byChannel,
    timeline: Object.entries(timeline).map(([hour, sentiments]) => ({
      hour,
      ...sentiments,
    })),
    details: details.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts)),
  };
};
