# ⚡ Quick Start Guide

## 🚀 **Get Testing in 5 Minutes!**

### **Step 1: Setup (30 seconds)**
```bash
# Install dependencies
npm install

# Update test credentials
# Edit .env file with your actual credentials
TEST_USERNAME=your_email@example.com
TEST_PASSWORD=your_password
```

### **Step 2: Run Example Test (1 minute)**
```bash
# Run the existing login test
npm run test
```
Watch it work! You'll see:
- Browser opens automatically
- Test navigates and fills forms
- Screenshots saved in `test-results/`

### **Step 3: Create Your First Test (3 minutes)**
```bash
# Copy the template
cp templates/test-template.spec.ts tests/my-first-test.spec.ts
```

**Edit your new test:**
```typescript
// Change this line:
test('TC_XXX: [TEMPLATE] Replace with Test Name', async ({ page }) => {

// To this:
test('TC_002: My First Test', async ({ page }) => {

// And this:
console.log('\n🚀 Starting Test: [Replace with your test name]');

// To this:
console.log('\n🚀 Starting Test: My First Test');
```

**Run your test:**
```bash
npx playwright test tests/my-first-test.spec.ts
```

---

## 🎯 **Common Tasks - Copy & Paste Examples**

### **Navigate to a Page**
```typescript
const homePage = new HomePage(page);
await homePage.navigateToHome();
```

### **Fill a Form**
```typescript
import { FormHelpers } from '../../utils/test-helpers';

await FormHelpers.fillFormFields(page, {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});
```

### **Generate Test Data**
```typescript
import { DataHelpers, EmailHelpers } from '../../utils/test-helpers';

const testUser = DataHelpers.generateTestUser();
const email = EmailHelpers.generateTestEmail('user');
```

### **Take Screenshots**
```typescript
await homePage.takeScreenshot('step-description');
```

### **Wait for Something**
```typescript
import { WaitHelpers } from '../../utils/test-helpers';

await WaitHelpers.waitForUrl(page, '/dashboard');
await WaitHelpers.waitWithLog(2000, 'Form processing');
```

### **Verify Results**
```typescript
import { AssertionHelpers } from '../../utils/test-helpers';

await AssertionHelpers.assertElementVisible(page, '#success-message', 'Success Message');
await AssertionHelpers.assertUrlContains(page, '/success');
```

---

## 📋 **Test Template Checklist**

When creating a new test, replace these:

- [ ] `TC_XXX` → Your test case ID (e.g., `TC_003`)
- [ ] `[TEMPLATE] Replace with Test Name` → Your test name
- [ ] `[Replace with your test name]` → Your test description  
- [ ] `[Replace with test objective]` → What you're testing
- [ ] `Step 1: [Replace with your step name]` → Actual step names
- [ ] Add your actual test actions
- [ ] Add proper assertions

---

## 🏗️ **Page Object Checklist**

When creating a new page object, replace these:

- [ ] `[PageName]` → Your page name (e.g., `Dashboard`, `Profile`)
- [ ] `[PageName]Page` → Your class name (e.g., `DashboardPage`)
- [ ] Update selector arrays with real selectors
- [ ] Implement navigation method
- [ ] Add your page-specific methods
- [ ] Update URL patterns for validation

---

## 🐛 **Troubleshooting**

### **Element Not Found**
1. Check the screenshot in `test-results/`
2. Use debug helper to see available elements:
```typescript
import { DebugHelpers } from '../../utils/test-helpers';
await DebugHelpers.logPageElements(page, 'button');
```
3. Add more selectors to your page object

### **Test Timeout**
1. Increase timeout for slow operations:
```typescript
await page.waitForLoadState('networkidle', { timeout: 30000 });
```
2. Use specific waits instead of generic timeouts

### **Screenshots Not Clear**
1. Take screenshots at key points:
```typescript
await homePage.takeScreenshot('before-click');
await button.click();
await homePage.takeScreenshot('after-click');
```

---

## 📁 **File Organization**

### **Tests**
- `tests/` - Test cases
- `tests/regression/` - Full regression tests  
- `tests/api/` - API tests (future)

### **Page Objects**
- `pages/` - All page objects
- Name pattern: `[PageName]Page.ts`

### **Test Data**
- `utils/test-data.ts` - Static test data
- Use `DataHelpers` for dynamic data

---

## ⚡ **Commands Cheat Sheet**

```bash
# Run all tests (visible browser)
npm run test

# Run specific test
npx playwright test tests/login.spec.ts

# Debug mode
npm run test:debug

# Headless mode  
npm run test:headless

# Show results
npm run report

# Clean up
npm run clean
```

---

## 🎯 **Next Steps**

1. **Study the examples:** Look at `tests/login.spec.ts` and `pages/LoginPage.ts`
2. **Try the helpers:** Experiment with functions in `utils/test-helpers.ts`
3. **Read the full guide:** Check `docs/FRAMEWORK_GUIDE.md` for detailed explanations
4. **Start testing:** Use templates to create your own tests!

**Happy Testing! 🧪✨** 