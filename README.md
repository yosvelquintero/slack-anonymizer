# Slack Anonymizer

A HonoJS application for anonymizing Slack messages with sentiment analysis and statistics.

## Features

- **Comprehensive Anonymization**: Removes sensitive information including emails, phone numbers, credit cards, SSNs, IP addresses, URLs, SSH keys, and more
- **User Identity Protection**: Converts user IDs to hashed anonymous identifiers using SHA-256
- **Sentiment Analysis**: Analyzes message sentiment (positive, negative, neutral) with detailed statistics
- **Statistical Insights**: Generates comprehensive statistics including user activity, channel metrics, and keyword analysis
- **REST API**: Built with HonoJS framework for high performance
- **Interactive Documentation**: Swagger UI for easy API exploration and testing
- **OpenAPI 3.0**: Full specification compliance with request/response validation
- **Type Safety**: Zod schema validation for robust data handling

## Installation

```bash
pnpm install
```

## Usage

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm start
```

## API Endpoints

- `GET /api/v1` - Health check and API status
- `GET /api/v1/messages` - Get all messages
- `GET /api/v1/messages/anonymized` - Get anonymized messages
- `GET /api/v1/messages/{ts}/anonymized` - Get specific anonymized message by timestamp
- `GET /api/v1/sentiment` - Get detailed sentiment analysis
- `GET /api/v1/stats` - Get comprehensive message statistics
- `GET /docs` - Interactive API documentation (Swagger UI)

## API Documentation

The API includes comprehensive documentation accessible via Swagger UI:

- **Development**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/doc

## Anonymization Features

The application provides robust anonymization of sensitive information:

- **Email Addresses**: `john.doe@company.com` → `[EMAIL]`
- **Phone Numbers**: `(555) 987-6543`, `555-123-4567` → `[PHONE]`
- **Credit Card Numbers**: `4111-1111-1111-1111` → `[CREDIT_CARD]`
- **Social Security Numbers**: `123-45-6789` → `[SSN]`
- **IP Addresses**: `192.168.1.100` → `[IP_ADDRESS]`
- **URLs**: `https://example.com` → `[URL]`
- **SSH Keys**: `ssh-rsa AAAAB3NzaC1yc2E...` → `[SSH_KEY]`
- **Internal Servers**: `server.company.com` → `[INTERNAL_SERVER]`
- **Large Amounts**: `$150,000` → `[AMOUNT]`
- **Account Numbers**: `Account 9876543210` → `Account [REDACTED]`
- **Transaction IDs**: `TXN-2024-001234` → `[TRANSACTION_ID]`

## Testing

Use the included `rest.http` file to test all API endpoints with VS Code REST Client extension.

### Sample Test Cases

The `rest.http` file includes comprehensive test cases for:

- Health check and API status
- Retrieving all messages (raw and anonymized)
- Individual message anonymization by timestamp
- Statistical analysis and sentiment detection
- Error handling (404 responses)
- API documentation access

### Mock Data

The application includes realistic mock Slack messages containing various types of sensitive information for testing anonymization features.

## Project Structure

```
slack-anonymizer/
├── src/
│   ├── index.js            # Main Hono application with OpenAPI routes
│   ├── data/
│   │   └── mockMessages.js # Mock Slack message data with realistic sensitive information
│   ├── utils/
│   │   ├── anonymizer.js   # Anonymization logic with crypto hashing
│   │   ├── analyzer.js     # Statistics and sentiment analysis
│   │   └── stopwords.js    # Common English stop words for text processing
│   └── schemas/
│       └── api.js          # Zod schemas for API validation
├── rest.http               # VS Code REST Client test file
├── .gitignore
├── package.json
├── README.md
└── pnpm-lock.yaml
```

## Dependencies

- **@hono/zod-openapi**: OpenAPI integration with Zod validation
- **@hono/swagger-ui**: Interactive API documentation
- **@hono/node-server**: Node.js server adapter for Hono
- **zod**: Schema validation and type safety

## Security & Performance

- **Cryptographic Hashing**: Uses SHA-256 for consistent, secure user ID anonymization
- **Pattern Matching**: Efficient regex-based sensitive data detection
- **Memory Efficient**: Processes messages without storing sensitive data
- **Type Safety**: Full TypeScript-like validation with Zod schemas
- **Input Validation**: All API endpoints validate requests and responses

## Development

The application is built with modern JavaScript practices:

- ES6 modules and arrow functions
- Comprehensive JSDoc documentation
- Consistent code style and error handling
- RESTful API design principles

## License

MIT
