# BlackRock Retirement Auto-Savings Challenge

A production-grade REST API for the BlackRock Retirement Auto-Savings Challenge, built with **Fastify**, **TypeScript**, **Zod**, and **Luxon**.

## Features

- ✅ **Transaction Parsing**: Convert expenses to transactions with remanent calculations
- ✅ **Validation**: Strict input validation with duplicate detection
- ✅ **Temporal Filtering**: Apply q, p, k period constraints with efficient lookups
- ✅ **NPS Calculations**: Compute NPS deduction and tax benefits
- ✅ **Index Fund Returns**: Calculate compound interest with inflation adjustment
- ✅ **Performance Monitoring**: Track memory, CPU, and processing time
- ✅ **Docker Ready**: Containerized on Alpine Node with health checks
- ✅ **Comprehensive Tests**: Unit and integration tests with Vitest

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Fastify** | HTTP framework (2–3× faster than Express) |
| **TypeScript** | Static typing for reliability |
| **Zod** | Schema validation (replaces runtime checking) |
| **Luxon** | Precise datetime parsing and comparisons |
| **Vitest** | Fast unit testing with coverage |
| **Pino** | Structured logging |
| **Docker** | Alpine Node.js containerization |

## Project Structure

```
blackrock/
├── src/
│   ├── index.ts                    # Main Fastify server
│   ├── types.ts                    # Type definitions & Zod schemas
│   ├── services/
│   │   ├── RemanentCalculator.ts   # Remanent & period logic
│   │   ├── FinancialCalculator.ts  # NPS, Index Fund, Tax calcs
│   │   └── PerformanceMonitor.ts   # System metrics
│   ├── controllers/
│   │   ├── TransactionController.ts
│   │   ├── ReturnsController.ts
│   │   └── PerformanceController.ts
│   └── utils/
│       └── dateUtils.ts            # Date parsing & period lookups
├── test/
│   ├── services/                   # Service unit tests
│   └── utils/                      # Utility unit tests
├── Dockerfile                       # Alpine Node.js image
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Installation

### Prerequisites
- Node.js 22+
- npm or yarn

### Setup

```bash
# Clone and install
cd blackrock
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Start development server
npm run dev

# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

## API Endpoints

### Transaction Endpoints

#### `POST /transactions:parse`
Parse expenses and calculate remanents.

**Request:**
```json
{
  "expenses": [
    { "date": "2024-01-15T10:00:00Z", "amount": 250 }
  ],
  "q_periods": [],
  "p_periods": [],
  "k_periods": []
}
```

**Response:**
```json
{
  "transactions": [
    {
      "date": "2024-01-15T10:00:00Z",
      "amount": 250,
      "ceiling": 300,
      "remanent": 50
    }
  ],
  "count": 1,
  "timestamp": "2024-02-21T10:00:00Z"
}
```

#### `POST /transactions:validator`
Validate payload and detect duplicates.

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "duplicates_detected": [],
  "transaction_count": 1
}
```

#### `POST /transactions:filter`
Filter transactions by q/p/k periods.

**Response:**
```json
{
  "filtered_transactions": [...],
  "k_period_groups": {
    "k_period_0": [...]
  }
}
```

### Returns Endpoints

#### `POST /returns:nps`
Calculate NPS deduction and tax benefit.

**Request:**
```json
{
  "age": 35,
  "annual_income": 1000000,
  "invested": 150000,
  "years": 5
}
```

**Response:**
```json
{
  "contribution_base": 150000,
  "nps_deduction": 100000,
  "annual_nps_benefit": 5000,
  "tax_benefit_percent": 0.5,
  "years": 5
}
```

#### `POST /returns:index`
Calculate index fund returns with inflation adjustment.

**Request:**
```json
{
  "annual_return_rate": 0.08,
  "inflation_rate": 0.05,
  "years": 10
}
```

**Response:**
```json
{
  "principal": 0.08,
  "rate": 0.08,
  "years": 10,
  "amount_nominal": 215892.5,
  "amount_real": "148643.63"
}
```

### Health & Performance

#### `GET /health`
Health check for Docker container.

#### `GET /performance`
System performance metrics (memory, CPU, threads, processing time).

#### `GET /docs`
API documentation.

## Algorithm Details

### Remanent Calculation
```
ceiling = Math.ceil(amount / 100) * 100
remanent = ceiling - amount

# With q-period override (latest start wins):
remanent = q_period.fixed

# With p-period additions (sum all matching):
remanent += sum(p_period.extra for all matching)
```

### Period Lookups
- **Q-periods**: Sorted by start date descending; first match wins
- **P-periods**: All matching periods summed
- **K-periods**: Transactions grouped by date range

### Performance
- **Time Complexity**: O(n log m) for n transactions × m periods (with sorted binary search)
- **Space Complexity**: O(n) for transaction storage
- **Handles**: Up to 10⁶ transactions efficiently

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# UI dashboard
npm run test:ui
```

### Integration Tests with Postman

A complete Postman collection is provided for testing all API endpoints:

**Files:**
- `postman_collection.json` - Importable test collection
- [POSTMAN_SETUP.md](POSTMAN_SETUP.md) - Detailed setup guide

**Quick Start:**
1. Open Postman
2. Click **Import** → Upload `postman_collection.json`
3. Ensure server running: `npm run dev`
4. Run collection tests
5. View results with automated assertions

**Test Coverage:**
- ✅ 8 main endpoints
- ✅ Happy path scenarios
- ✅ Error case validation
- ✅ Duplicate detection
- ✅ Performance metrics
- ✅ 30+ automated assertions

### Test Coverage
- ✅ Remanent calculation edge cases
- ✅ Period overlap handling
- ✅ Tax slab calculations
- ✅ NPS deduction limits
- ✅ Inflation adjustments
- ✅ Date range validation
- ✅ Duplicate detection

## Performance Monitoring

All endpoints return response headers with metrics:
- `X-Processing-Time-Ms`: Request processing duration
- `X-Memory-Used-Mb`: Heap memory usage

Example:
```
X-Processing-Time-Ms: 45
X-Memory-Used-Mb: 125.34
```

## Docker

The `Dockerfile` uses a multi-stage Alpine Node.js image:
- **Base**: `node:22-alpine` (minimal attack surface)
- **Port**: 5477
- **Health Check**: Every 30 seconds
- **Production Ready**: Optimized for security and performance

```bash
docker build -t blk-hacking-ind-mayank .
docker run -p 5477:5477 blk-hacking-ind-mayank
```

## Development

### Linting
```bash
npm run lint
```

### TypeScript Check
```bash
npx tsc --noEmit
```

### Watch Mode
```bash
npm run dev
```

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LOG_LEVEL` | `info` | Pino logger level |
| `NODE_ENV` | `development` | Environment mode |

## Compilation & Distribution

```bash
# Build to dist/
npm run build

# Start from dist/
npm start
```

## License

MIT

## Author

Mayank - BlackRock Challenge Submission
