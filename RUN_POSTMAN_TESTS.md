# 🚀 Postman Testing - Quick Start Guide

## ✅ Server Status
**Your API is currently RUNNING on `http://localhost:5477`**

## Step-by-Step: Import & Run Postman Tests

### 1. **Open Postman**
   - Download from [getpostman.com](https://www.getpostman.com/downloads/)
   - Or use Postman Web if you have an account

### 2. **Import the Collection**
   
   **Option A: Upload JSON File (Recommended)**
   ```
   Postman → File → Import
   → Click "Upload Files"
   → Select: postman_collection.json
   → Click "Import"
   ```

   **Option B: Link Import**
   ```
   Postman → Import → Link
   → Paste raw GitHub link to postman_collection.json
   → Click "Load" → "Import"
   ```

### 3. **Verify Base URL**
   ```
   Bottom-left corner → Select Environment
   → Look for: base_url = http://localhost:5477
   → If different, update it
   ```

### 4. **Run All Tests**
   
   **Option A: Run Full Collection**
   ```
   Select: "BlackRock Retirement..." collection
   Click: "Run" button (or Ctrl+Alt+R on Windows)
   Click: "Run [Collection Name]"
   ```

   **Option B: Run Single Folder**
   ```
   Right-click: "1. Health & Documentation"
   Select: "Run"
   ```

   **Option C: Run Single Request**
   ```
   Click: "POST Parse Expenses to Transactions"
   Click: "Send"
   Check: "Tests" tab for results
   ```

## 📊 Test Results

### All Green ✅
```
✓ Status 200 OK
✓ Response has transactions array
✓ First transaction calculated ceiling=300
✓ Q-period override applied (remanent=75)
✓ Has X-Processing-Time header
```

### Test Execution Report
After running collection:
1. Results panel shows: **Passed: 20/20** (for example)
2. Each folder color:
   - 🟢 Green = All tests passed
   - 🔴 Red = Some tests failed

## 🔍 Detailed Test Execution

### Test Folders

**1. Health & Documentation** (3 tests)
- `GET /health` → Verify server running
- `GET /performance` → Check system metrics
- `GET /docs` → API documentation

**2. Transaction Processing** (12 tests)
- Parse expenses with remanent calculations
- Validate transactions & detect duplicates
- Filter by k-periods

**3. Financial Calculations** (10 tests)
- NPS deduction (with limits verification)
- Index fund returns (inflation-adjusted)

**4. Error Cases & Validation** (8 tests)
- Invalid date formats → **400**
- Duplicate timestamps → **422**
- Invalid NPS input → **400**
- Missing fields → **400**

## 📈 Sample API Response

### ✅ Parse Transactions
**Request:**
```json
{
  "expenses": [{
    "date": "2024-01-15T10:30:00Z",
    "amount": 250
  }],
  "q_periods": [],
  "p_periods": [],
  "k_periods": []
}
```

**Response:**
```json
{
  "transactions": [{
    "date": "2024-01-15T10:30:00Z",
    "amount": 250,
    "ceiling": 300,
    "remanent": 50
  }],
  "count": 1,
  "timestamp": "2026-02-21T08:47:40.733Z"
}
```

### ✅ Validate Transactions
**Status:** `200 OK` + Headers:
- `X-Processing-Time-Ms: 5`
- `X-Memory-Used-Mb: 125.42`

### ✅ Calculate NPS
**Input:** Income 1M, invested 150k
**Output:** Deduction 100k (10% limit)

### ✅ Index Fund Returns
**Input:** 8% return, 5% inflation, 10 years
**Output:** Nominal ~215k, Real ~148k

## 🛠️ Debugging

### Issue: Connection Refused
**Solution:**
```bash
# Verify server running
curl http://localhost:5477/health

# If fails, restart server
cd c:\Users\Mayank\Desktop\code\blackrock
npm run build
node dist/index.js
```

### Issue: Tests Failing
1. Check **Response** tab for actual response
2. Look at **Test** tab for assertion that failed
3. Compare with **Request** tab (what was sent)
4. Check timestamp format: `YYYY-MM-DDTHH:mm:ssZ`

### Issue: Wrong Endpoint
- Verify base_url variable = `http://localhost:5477`
- Update in Postman environment if needed

## 📋 Endpoint Reference

| Method | Path | Tests |
|--------|------|-------|
| GET | `/health` | Status 200, JSON response |
| GET | `/performance` | Metrics present, valid values |
| GET | `/docs` | API structure |
| POST | `/api/transactions/parse` | Remanent calc, ceiling verify |
| POST | `/api/transactions/validate` | Validation, duplicates |
| POST | `/api/transactions/filter` | K-period grouping |
| POST | `/api/returns/nps` | Limits check, deduction calc |
| POST | `/api/returns/index` | Inflation adjustment |

## 💾 Export Test Results

After running tests:
1. Result panel (right side) appears
2. Click **Export** (top-right of results)
3. Choose: **JSON** or **HTML**
4. Save report for documentation

## ✨ Advanced: Custom Tests

Edit request → **Tests** tab → Add custom assertions:

```javascript
// Example: Check response time
pm.test('Response < 100ms', () => {
  pm.expect(pm.response.responseTime).to.be.below(100);
});

// Example: Check memory usage
pm.test('Memory < 200MB', () => {
  let mb = pm.response.json().memory_used_mb;
  pm.expect(mb).to.be.below(200);
});
```

## 🎯 Expected Results Summary

```
✅ 8 Endpoints
✅ 33+ Automated Tests
✅ Happy Path Scenarios  
✅ Error Case Validation
✅ Performance Monitoring
✅ Response Time < 100ms
✅ Memory Usage Tracked
✅ All Assertions Pass
```

---

**Server Ready:** http://localhost:5477  
**Collection File:** `postman_collection.json`  
**Documentation:** [POSTMAN_SETUP.md](POSTMAN_SETUP.md)

**Happy Testing! 🚀**
