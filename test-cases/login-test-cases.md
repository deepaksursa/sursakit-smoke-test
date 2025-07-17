# 🔐 Sursakit Login - Test Cases (Local Environment)

**Application:** Sursakit (http://localhost:5173)  
**Module:** Login  
**Updated:** 2024-07-07
**Environment:** Local Development (Cloudflare Turnstile Disabled)

---

## 📋 Test Cases Summary

| ID | Test Case | Priority | Status | Automated |
|----|-----------|----------|---------|-----------|
| TC_001 | Valid login (local) | High | ✅ | ✅ |

---

## 🧪 Test Cases

### **TC_001: Valid Login (Local Environment)**
**Objective:** User logs in successfully with valid credentials on localhost

**Preconditions:**
- Local app running on http://localhost:5173
- Cloudflare Turnstile disabled
- Valid test credentials in .env file

**Steps:**
1. Go to http://localhost:5173
2. Click on Sign In button 
3. Enter valid email & password from .env
4. Click Login

**Expected:** 
- Redirects away from login page
- No error messages
- Access to logged-in areas

**Test Data:** Use `.env` credentials

---

## 🔧 Setup

**Environment:**
```bash
BASE_URL=http://localhost:5173
TEST_USERNAME=your_email@example.com
TEST_PASSWORD=your_password
HEADLESS=false
```

**Run Tests:**
```bash
npm run test               # Run test (with browser visible)
npm run test:headless     # Run test (background)
npm run test:debug        # Debug mode
```

---

## 🐛 Known Issues

1. **Selector Flexibility** - Test uses multiple selectors to find elements
2. **Screenshots** - Automatic screenshots for debugging
3. **Credentials Required** - Update .env with valid local credentials

---

## 📊 Execution Log

| Date | Tests Run | Pass | Fail | Notes |
|------|-----------|------|------|-------|
| 2024-07-07 | TC_001 | - | - | Configured for local testing |

## 🎯 Next Steps

1. **Update .env** - Add your actual test credentials
2. **Run first test** - `npm run test`
3. **Check screenshots** - Review test-results/ for any issues
4. **Adjust selectors** - If elements not found, check screenshots and update selectors

 