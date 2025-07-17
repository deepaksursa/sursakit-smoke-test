# 🚀 Test Automation Framework Guide

## 📚 **Complete Guide for Junior Developers**

Welcome to the Sursakit Test Automation Framework! This guide will help you understand and use the framework effectively.

---

## 🎯 **Framework Overview**

### **What is this framework?**
- **Page Object Model (POM)** implementation
- **Playwright** for browser automation
- **TypeScript** for type safety and better IDE support
- **Modular design** for maintainability and reusability

### **Why use this framework?**
- ✅ **Easy to learn** - Clear patterns and templates
- ✅ **Maintainable** - Changes in UI only require page object updates
- ✅ **Reusable** - Page objects work across multiple tests
- ✅ **Reliable** - Multiple selector strategies for robust element finding
- ✅ **Debuggable** - Automatic screenshots and detailed logging

---

## 📁 **Project Structure**

```
sursakit-smoke-test/
├── 📁 pages/                    # Page Object Model classes
│   ├── BasePage.ts             # Base class with common functionality
│   ├── HomePage.ts             # Homepage interactions
│   └── LoginPage.ts            # Login page interactions
├── 📁 tests/                   # Test implementations
│   └── login.spec.ts           # Example test
├── 📁 utils/                   # Helper utilities
│   ├── test-data.ts           # Test data configuration
│   └── test-helpers.ts        # Helper functions
├── 📁 templates/               # Templates for new tests/pages
│   ├── test-template.spec.ts  # Test template
│   └── page-template.ts       # Page object template
├── 📁 docs/                    # Documentation
└── 📁 test-results/            # Test outputs (screenshots, videos)
```

---

## 🧪 **Writing Your First Test**

### **Step 1: Copy the Test Template**
```bash
# Copy template to create new test
cp templates/test-template.spec.ts tests/my-new-test.spec.ts
```

### **Step 2: Update the Template**
Replace the placeholder content:

```typescript
// Before (template)
test('TC_XXX: [TEMPLATE] Replace with Test Name', async ({ page }) => {

// After (your test)
test('TC_002: User Registration with Valid Data', async ({ page }) => {
```

### **Step 3: Add Your Test Steps**
```typescript
await test.step('Navigate to Registration Page', async () => {
  console.log('📍 Going to registration page');
  
  const homePage = new HomePage(page);
  await homePage.navigateToHome();
  await homePage.clickRegistrationLink(); // You'll implement this
  
  console.log('✅ Successfully navigated to registration');
});
```

### **Step 4: Use Helper Functions**
```typescript
import { DataHelpers, FormHelpers } from '../../utils/test-helpers';

// Generate test data
const testUser = DataHelpers.generateTestUser();

// Fill form easily
await FormHelpers.fillFormFields(page, {
  firstName: testUser.firstName,
  lastName: testUser.lastName,
  email: testUser.email
});
```

---

## 🏗️ **Creating Page Objects**

### **Step 1: Copy the Page Template**
```bash
cp templates/page-template.ts pages/RegistrationPage.ts
```

### **Step 2: Replace Placeholders**
Find and replace `[PageName]` with your actual page name:
- `[PageName]Page` → `RegistrationPage`
- `navigateTo[PageName]` → `navigateToRegistration`
- `isOn[PageName]Page` → `isOnRegistrationPage`

### **Step 3: Define Your Selectors**
```typescript
export class RegistrationPage extends BasePage {
  // Define selectors for your page elements
  private firstNameSelectors = [
    'input[name="firstName"]',
    'input[id="firstName"]',
    '[data-testid="first-name"]',
    'input[placeholder*="first name" i]'
  ];

  private submitButtonSelectors = [
    'button[type="submit"]',
    'button:has-text("Register")',
    '[data-testid="register-button"]'
  ];
  
  // ... rest of your implementation
}
```

### **Step 4: Implement Page Methods**
```typescript
/**
 * Fill first name field
 */
async fillFirstName(firstName: string): Promise<void> {
  const input = await this.findElement(this.firstNameSelectors);
  if (!input) {
    await this.takeScreenshot('first-name-not-found');
    throw new Error('First name input not found');
  }
  await input.fill(firstName);
  console.log(`✅ First name entered: ${firstName}`);
}

/**
 * Complete registration workflow
 */
async completeRegistration(userData: UserData): Promise<boolean> {
  console.log('🎯 Starting registration workflow');
  
  await this.fillFirstName(userData.firstName);
  await this.fillLastName(userData.lastName);
  await this.fillEmail(userData.email);
  await this.clickSubmit();
  
  return await this.verifyRegistrationSuccess();
}
```

---

## 🔧 **Using Helper Functions**

### **Email Helpers**
```typescript
import { EmailHelpers } from '../utils/test-helpers';

// Generate unique test email
const email = EmailHelpers.generateTestEmail('user');
// Result: "user+1684739284321@example.com"

// Validate email format
const isValid = EmailHelpers.isValidEmail('test@example.com'); // true
```

### **Form Helpers**
```typescript
import { FormHelpers } from '../utils/test-helpers';

// Fill multiple form fields at once
await FormHelpers.fillFormFields(page, {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '1234567890'
});

// Select dropdown option
await FormHelpers.selectDropdownOption(page, '#country', 'United States');
```

### **Wait Helpers**
```typescript
import { WaitHelpers } from '../utils/test-helpers';

// Wait with logging
await WaitHelpers.waitWithLog(2000, 'Form submission processing');

// Wait for element to disappear
await WaitHelpers.waitForElementToDisappear(page, '.loading-spinner');

// Wait for URL change
await WaitHelpers.waitForUrl(page, '/dashboard');
```

### **Assertion Helpers**
```typescript
import { AssertionHelpers } from '../utils/test-helpers';

// Verify element visibility
await AssertionHelpers.assertElementVisible(page, '#welcome-message', 'Welcome Message');

// Verify text content
await AssertionHelpers.assertTextContent(page, '.success', 'Registration Successful', 'Success Message');

// Verify URL
await AssertionHelpers.assertUrlContains(page, '/dashboard');
```

### **Debug Helpers**
```typescript
import { DebugHelpers } from '../utils/test-helpers';

// Log page elements for debugging
await DebugHelpers.logPageElements(page, 'button');

// Log current page info
await DebugHelpers.logPageInfo(page);

// Take debug screenshot
await DebugHelpers.takeDebugScreenshot(page, 'form-validation-error');
```

---

## 📊 **Test Data Management**

### **Using Existing Data**
```typescript
import { TestCredentials, TestConfig } from '../utils/test-data';

// Use predefined test users
const validUser = TestCredentials.validUser;
const invalidUser = TestCredentials.invalidUser;

// Use configuration
const timeout = TestConfig.timeouts.default;
const baseUrl = TestConfig.urls.base;
```

### **Generating Dynamic Data**
```typescript
import { DataHelpers } from '../utils/test-helpers';

// Generate unique test user
const testUser = DataHelpers.generateTestUser();
console.log(testUser.email); // "TestFirstABC123+userDEF456@example.com"

// Generate random strings
const randomId = DataHelpers.generateRandomString(10);

// Format dates
const today = DataHelpers.formatDateForInput(new Date()); // "2024-01-15"
```

---

## 🐛 **Debugging & Troubleshooting**

### **Automatic Screenshots**
The framework automatically takes screenshots:
- When elements are not found
- On test failures
- At key test steps (when you call `takeScreenshot()`)

Screenshots are saved in `test-results/` with timestamps.

### **Console Logging**
Every action logs to console:
```
🚀 Starting Test: User Registration
📍 Going to registration page
✅ Successfully navigated to registration
📝 Filling registration form...
✅ First name entered: TestFirstABC123
```

### **Debug Mode**
Run tests in debug mode:
```bash
npm run test:debug
```

### **Finding Elements**
If an element isn't found, the framework will:
1. Try multiple selectors automatically
2. Take a screenshot
3. Log available elements for debugging

### **Common Issues & Solutions**

**Element not found:**
```typescript
// ❌ Bad - single selector
await page.click('button');

// ✅ Good - multiple selectors in page object
private submitSelectors = [
  'button[type="submit"]',
  'button:has-text("Submit")',
  '[data-testid="submit"]',
  '.submit-button'
];
```

**Timing issues:**
```typescript
// ❌ Bad - hard wait
await page.waitForTimeout(5000);

// ✅ Good - wait for specific condition
await page.waitForLoadState('networkidle');
await WaitHelpers.waitForUrl(page, '/success');
```

---

## 📝 **Best Practices**

### **Test Writing**
- ✅ Use descriptive test names: `TC_002: User Registration with Valid Data`
- ✅ Add console logs for test steps
- ✅ Take screenshots at key points
- ✅ Use assertions to verify expected behavior
- ✅ Clean up test data when needed

### **Page Objects**
- ✅ Use multiple selectors for each element
- ✅ Group related functionality together
- ✅ Add JSDoc comments for all public methods
- ✅ Handle errors gracefully with screenshots
- ✅ Create high-level workflow methods

### **Selectors**
- ✅ Prefer `data-testid` attributes when available
- ✅ Use semantic selectors (`input[type="email"]`)
- ✅ Include text-based selectors as fallbacks
- ✅ Avoid brittle selectors (CSS classes that change often)

---

## 🚦 **Running Tests**

### **Development**
```bash
# Run all tests with browser visible
npm run test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run tests matching pattern
npx playwright test --grep "registration"
```

### **Debugging**
```bash
# Debug mode (stops at breakpoints)
npm run test:debug

# Headless mode
npm run test:headless

# Show test report
npm run report
```

### **CI/CD**
```bash
# Clean run (headless, with retries)
npm run test:headless
```

---

## 📚 **Additional Resources**

### **Playwright Documentation**
- [Official Playwright Docs](https://playwright.dev/docs/intro)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Assertions Guide](https://playwright.dev/docs/test-assertions)

### **Framework Examples**
- Check `tests/login.spec.ts` for a complete example
- Review `pages/LoginPage.ts` for page object patterns
- Use `templates/` for starting new tests/pages

### **Getting Help**
1. Check existing page objects for similar functionality
2. Use debug helpers to understand page structure
3. Take screenshots to visualize issues
4. Ask senior developers for code review

---

## 🎉 **You're Ready!**

With this framework, you can:
- 🧪 Write maintainable tests quickly
- 🏗️ Create reusable page objects
- 🔧 Use powerful helper functions  
- 🐛 Debug issues effectively
- 📊 Manage test data easily

**Start with the templates and gradually build your testing skills!** 🚀 