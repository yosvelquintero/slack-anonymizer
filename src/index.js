import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { serve } from '@hono/node-server';
import { mockMessages } from './data/mockMessages.js';
import { anonymizeMessage, anonymizeMessages } from './utils/anonymizer.js';
import { analyzeMessages, getSentimentStats } from './utils/analyzer.js';
import {
  MessageSchema,
  MessagesResponseSchema,
  StatsResponseSchema,
  SentimentResponseSchema,
  ErrorResponseSchema,
  HealthResponseSchema,
} from './schemas/api.js';

const app = new OpenAPIHono();

// Define routes using createRoute
const healthRoute = createRoute({
  method: 'get',
  path: '/api/v1',
  summary: 'Health check',
  description: 'Check if the API is running and get available endpoints',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthResponseSchema,
        },
      },
      description: 'API status',
    },
  },
});

const messagesRoute = createRoute({
  method: 'get',
  path: '/api/v1/messages',
  summary: 'Get all messages',
  description: 'Retrieve all Slack messages',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessagesResponseSchema,
        },
      },
      description: 'List of all messages',
    },
  },
});

const anonymizedMessagesRoute = createRoute({
  method: 'get',
  path: '/api/v1/messages/anonymized',
  summary: 'Get anonymized messages',
  description: 'Retrieve all messages with anonymized user information and sensitive data',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessagesResponseSchema,
        },
      },
      description: 'List of anonymized messages',
    },
  },
});

const messageByIdRoute = createRoute({
  method: 'get',
  path: '/api/v1/messages/{ts}/anonymized',
  summary: 'Get anonymized message by timestamp',
  description: 'Get a specific message by timestamp with anonymized user information and sensitive data',
  request: {
    params: z.object({
      ts: z.string().openapi({
        param: {
          name: 'ts',
          in: 'path',
        },
        example: '1736954100.000001',
      }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: MessageSchema,
          }),
        },
      },
      description: 'Anonymized message',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Message not found',
    },
  },
});

const sentimentRoute = createRoute({
  method: 'get',
  path: '/api/v1/sentiment',
  summary: 'Get sentiment analysis',
  description: 'Get detailed sentiment analysis of all messages including overall sentiment, by user, and by channel',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SentimentResponseSchema,
        },
      },
      description: 'Sentiment analysis results',
    },
  },
});

const statsRoute = createRoute({
  method: 'get',
  path: '/api/v1/stats',
  summary: 'Get message statistics',
  description: 'Get comprehensive statistics about messages including user activity, channel activity, and keywords',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: StatsResponseSchema,
        },
      },
      description: 'Message statistics',
    },
  },
});

// Register routes
app.openapi(healthRoute, (c) => {
  return c.json({
    message: 'Slack Anonymizer API is running',
    version: '1.0.0',
    endpoints: [
      '/api/v1/messages',
      '/api/v1/messages/anonymized',
      '/api/v1/messages/{ts}/anonymized',
      '/api/v1/sentiment',
      '/api/v1/stats',
      '/docs',
    ],
  });
});

app.openapi(messagesRoute, (c) => {
  return c.json({
    success: true,
    data: mockMessages,
    count: mockMessages.length,
  });
});

app.openapi(anonymizedMessagesRoute, (c) => {
  const anonymizedMessages = anonymizeMessages(mockMessages);
  return c.json({
    success: true,
    data: anonymizedMessages,
    count: anonymizedMessages.length,
  });
});

app.openapi(messageByIdRoute, (c) => {
  const { ts } = c.req.valid('param');
  const message = mockMessages.find((msg) => msg.ts === ts);

  if (!message) {
    return c.json({ success: false, error: 'Message not found' }, 404);
  }

  const anonymizedMessage = anonymizeMessage(message);
  return c.json({
    success: true,
    data: anonymizedMessage,
  });
});

app.openapi(sentimentRoute, (c) => {
  const sentimentStats = getSentimentStats(mockMessages);
  return c.json({
    success: true,
    data: sentimentStats,
  });
});

app.openapi(statsRoute, (c) => {
  const stats = analyzeMessages(mockMessages);
  return c.json({
    success: true,
    data: stats,
  });
});

// The OpenAPI documentation will be available at /doc
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Slack Anonymizer API',
    description: 'API for anonymizing Slack messages with sentiment analysis and statistics',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
});

// Swagger UI endpoint
app.get('/docs', swaggerUI({ url: '/doc' }));

const port = process.env.PORT || 3000;

console.log(`🚀 Server is running on port ${port}`);
console.log(`📚 API Documentation available at: http://localhost:${port}/docs`);
console.log(`🔍 OpenAPI spec available at: http://localhost:${port}/doc`);
console.log(`📡 API Base URL: http://localhost:${port}/api/v1`);

serve({
  fetch: app.fetch,
  port,
});
