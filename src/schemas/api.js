import { z } from 'zod';

// Response schemas
export const MessageSchema = z.object({
  ts: z.string(),
  user: z.string(),
  username: z.string(),
  channel: z.string(),
  text: z.string(),
  reactions: z
    .array(
      z.object({
        emoji: z.string(),
        count: z.number(),
      })
    )
    .optional(),
  anonymized: z.boolean().optional(),
});

export const MessagesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(MessageSchema),
  count: z.number(),
});

export const StatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalMessages: z.number(),
    averageLength: z.number(),
    userStats: z.record(
      z.object({
        messageCount: z.number(),
        totalReactions: z.number(),
        averageLength: z.number(),
        totalLength: z.number(),
      })
    ),
    channelStats: z.record(
      z.object({
        messageCount: z.number(),
        totalReactions: z.number(),
        uniqueUsers: z.number(),
      })
    ),
    timeStats: z.record(z.number()),
    keywords: z.array(
      z.object({
        word: z.string(),
        count: z.number(),
      })
    ),
    sentimentOverview: z.object({
      positive: z.number(),
      negative: z.number(),
      neutral: z.number(),
    }),
    mostActiveUser: z.object({
      user: z.string().nullable(),
      count: z.number(),
    }),
    mostActiveChannel: z.object({
      channel: z.string().nullable(),
      count: z.number(),
    }),
  }),
});

export const SentimentResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    overall: z.object({
      positive: z.number(),
      negative: z.number(),
      neutral: z.number(),
    }),
    byUser: z.record(
      z.object({
        positive: z.number(),
        negative: z.number(),
        neutral: z.number(),
      })
    ),
    byChannel: z.record(
      z.object({
        positive: z.number(),
        negative: z.number(),
        neutral: z.number(),
      })
    ),
    timeline: z.array(
      z.object({
        hour: z.string(),
        positive: z.number(),
        negative: z.number(),
        neutral: z.number(),
      })
    ),
    details: z.array(
      z.object({
        ts: z.string(),
        user: z.string(),
        channel: z.string(),
        text: z.string(),
        sentiment: z.string(),
        score: z.number(),
        confidence: z.number(),
      })
    ),
  }),
});

export const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export const HealthResponseSchema = z.object({
  message: z.string(),
  version: z.string(),
  endpoints: z.array(z.string()),
});
