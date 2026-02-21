# Postman Test Collection Setup

## Overview

This collection contains comprehensive tests for all API endpoints of the BlackRock Retirement Auto-Savings Challenge. It includes:
- ✅ Happy path tests with valid data
- ✅ Error case tests with invalid inputs
- ✅ Automated assertions for each endpoint
- ✅ Performance monitoring headers validation
- ✅ Data validation checks

## Import Instructions

### Option 1: Import JSON File (Recommended)
1. Open Postman
2. Click **Import** (top-left)
3. Choose **Upload Files**
4. Select `postman_collection.json`
5. Click **Import**

### Option 2: Import from Link
1. Click **Import** → **Link**
2. Paste the raw URL to `postman_collection.json`
3. Click **Continue** → **Import**

## Environment Variables

The collection uses `{{base_url}}` variable set to `http://localhost:5477`

### To Change Base URL:
1. Click the environment dropdown (top-right)
2. Select **Manage Environments**
3. Edit the variable:
   ```
   base_url: http://your-server:5477
   ```

## Test Endpoints

### 1. Health & Performance (No Auth Required)

#### GET /health
Tests basic server health check.
- **Status**: 200 OK
- **Response**: `{ status: "ok", timestamp: "..." }`

#### GET /performance
Retrieves system performance metrics.
- **Response**: Memory usage, CPU, thread count, processing time

#### GET /docs
API documentation endpoint.
- **Response**: Endpoint list and API metadata

### 2. Transaction Endpoints

#### POST /transactions:parse
Parse expenses and calculate remanents with period overrides.

**Request Body:**
```json
{
  "expenses": [
    {"date": "2024-01-15T10:30:00Z", "amount": 250},
    {"date": "2024-01-20T14:15:00Z", "amount": 100}
  ],
  "q_periods": [
    {"fixed": 75, "start": "2024-01-01T00:00:00Z", "end": "2024-01-31T23:59:59Z"}
  ],
  "p_periods": [
    {"extra": 25, "start": "2024-01-01T00:00:00Z", "end": "2024-01-31T23:59:59Z"}
  ],
  "k_periods": [
    {"start": "2024-01-01T00:00:00Z", "end": "2024-01-31T23:59:59Z"}
  ]
}
```

**Tests:**
- ✅ Status 200
- ✅ Transactions array returned
- ✅ Ceiling calculation + period overrides applied
- ✅ Performance headers present

#### POST /transactions:validator
Validate transaction constraints and detect duplicates.

**Tests:**
- ✅ Valid transactions pass
- ✅ Duplicates detected
- ✅ Error details provided

#### POST /transactions:filter
Filter transactions by k-periods.

**Tests:**
- ✅ Filtered results returned
- ✅ K-period grouping correct
- ✅ Processing time tracked

### 3. Returns Endpoints

#### POST /returns:nps
Calculate NPS deduction and tax benefit.

**Request Body:**
```json
{
  "age": 35,
  "annual_income": 1000000,
  "invested": 150000,
  "years": 5
}
```

**Tests:**
- ✅ Status 200
- ✅ Deduction within limits (≤ 200k, ≤ 10% income)
- ✅ Tax benefit calculated
- ✅ All required fields present

#### POST /returns:index
Calculate index fund returns with inflation adjustment.

**Request Body:**
```json
{
  "annual_return_rate": 0.08,
  "inflation_rate": 0.05,
  "years": 10
}
```

**Tests:**
- ✅ Nominal vs real returns calculated
- ✅ Inflation adjustment applied
- ✅ Reasonable values returned

### 4. Error Cases

#### Invalid Transaction Data
- Tests with malformed dates → 400 Bad Request
- Tests with missing required fields

#### Duplicate Timestamps
- Detects multiple transactions with same timestamp
- Returns 422 Unprocessable Entity

#### Invalid NPS Parameters
- Tests negative income
- Tests invalid age
- Tests non-numeric inputs

## Running Tests

### Run All Tests
1. Select the collection: **BlackRock Retirement Auto-Savings Challenge**
2. Click **Run** (or press Alt+R)
3. Click **Run [Collection Name]**
4. View results in the Test Results panel

### Run Single Folder
1. Right-click folder (e.g., "Transactions")
2. Click **Run**

### Run Single Request
1. Click the request
2. Click **Send**
3. Check the **Tests** tab for results

## Test Results Interpretation

### All Tests Pass ✅
```
Status: 200
✔ All assertions passed
X-Processing-Time-Ms: 45ms
X-Memory-Used-Mb: 125.34
```

### Some Tests Fail ❌
Click the failing test to see:
- Expected vs actual value
- Assertion that failed
- Helpful error message

## Performance Monitoring

Each endpoint includes custom headers:
- `X-Processing-Time-Ms`: Request duration
- `X-Memory-Used-Mb`: Heap memory used

Check these in the Response Headers tab:
```
X-Processing-Time-Ms: 45
X-Memory-Used-Mb: 125.34
```

## Sample Test Scenarios

### Scenario 1: Basic Transaction Processing
1. Run **POST Parse Transactions**
   - Verify remanent calculation (250 → ceiling 300)
   - Check q-period override applied (remanent = 75)

2. Run **POST Validate Transactions**
   - Verify no errors or duplicates
   - Check transaction count

3. Run **POST Filter by Periods**
   - Verify k-period grouping
   - Check transaction distribution

### Scenario 2: Financial Calculations
1. Run **POST Calculate NPS Deduction**
   - For income 1M, invested 150k
   - Verify deduction = 100k (10% limit)
   - Check tax benefit > 0

2. Run **POST Calculate Index Fund Returns**
   - 8% return, 5% inflation, 10 years
   - Nominal amount ~215k
   - Real amount ~148k (inflation-adjusted)

### Scenario 3: Error Handling
1. Run **POST Invalid Transaction Request**
   - Bad date format → 400
   - Error message provided

2. Run **POST Duplicate Timestamps**
   - Validation fails → 422
   - Duplicate date in response

## Debugging Tips

### Check Request Body Format
- Use **Code** view to see formatted JSON
- Verify ISO 8601 date format: `YYYY-MM-DDTHH:mm:ssZ`

### View Full Response
- Click **Response** tab
- Select **Pretty** view for formatted JSON
- Use **Code** view for raw response

### Monitor Network Activity
- Open Postman console (Ctrl+Alt+C)
- See full HTTP request/response
- Check for network errors

### Validate Against Schema
- Each endpoint has type hints in implementation
- Use Zod validation schemas in API
- Error messages indicate which field failed

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure server running on port 5477 |
| Base URL wrong | Check variable: `{{base_url}}` |
| 400 Bad Request | Verify ISO date format and required fields |
| 422 Validation failed | Check for duplicate timestamps |
| Tests timeout | Increase timeout in settings |

## Next Steps

1. **Import the collection** into Postman
2. **Update base_url** if server on different host
3. **Run all tests** to verify API working
4. **Check performance metrics** in response headers
5. **Modify test data** for your use cases
6. **Export results** for documentation

## Export Test Results

### Run and Export
1. Run the full collection
2. Result panel appears
3. Click **Export Results** icon
4. Choose HTML or JSON format
5. Save the report

### Sample Report Shows
- Total tests run
- Pass/fail count
- Response times
- Assertions passed/failed
- Data from each request

## Advanced: Custom Tests

Edit any request's **Tests** tab to add custom assertions:

```javascript
// Check response time
pm.test('Response time < 100ms', function () {
    pm.expect(pm.response.responseTime).to.be.below(100);
});

// Validate numeric range
pm.test('NPS deduction in range', function () {
    let deduction = pm.response.json().nps_deduction;
    pm.expect(deduction).to.be.within(0, 200000);
});

// Store value for later use
let remanent = pm.response.json().transactions[0].remanent;
pm.environment.set('last_remanent', remanent);
```

## Support

For issues or questions:
- Check API documentation: [README.md](README.md)
- Review source code in `src/`
- Check test files in `test/`
- Verify request format matches schema in `src/types.ts`
