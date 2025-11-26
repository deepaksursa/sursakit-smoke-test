# 🚀 Sursakit Test Automation Framework

**Production-ready Playwright framework with Page Object Model for junior developers**

## ⚡ Quick Start

```bash
# Setup
npm install
cp .env.example .env  # Add your credentials

# Run tests
npm run test

# Create new test (copy from existing test)
cp tests/login.spec.ts tests/my-test.spec.ts
```

## 📁 Structure

```
├── pages/           # Page Object Model classes
├── tests/           # Test implementations  
├── utils/           # Helper functions & test data
└── fixtures/        # Test fixtures
```

## 🧪 Example Test

```typescript
import { test, expect } from "@playwright/test";
import { HomePage, LoginPage } from "../pages";
import { TestCredentials } from "../utils/test-data";

test("Login Test", async ({ page }) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  
  await homePage.navigateToHome();
  await homePage.goToLogin();
  
  const success = await loginPage.performLogin(
    TestCredentials.validUser.username,
    TestCredentials.validUser.password
  );
  
  expect(success).toBe(true);
});
```

## 🔧 Commands

```bash
npm run test              # Run tests (headed)
npm run test:headless     # Run tests (headless)
npm run test:debug        # Debug mode
npm run report           # View HTML report
```

## 📚 Features

- ✅ **Page Object Model** - Maintainable test structure
- ✅ **TypeScript** - Type safety and IntelliSense
- ✅ **Templates** - Copy-paste test and page templates
- ✅ **Helper Functions** - Common utilities included
- ✅ **Cloudflare Support** - Handles CAPTCHA challenges
- ✅ **Auto Screenshots** - Visual debugging on failures
- ✅ **Multiple Selectors** - Robust element finding

## 📖 Learn More

- **Working Example:** `tests/login.spec.ts` - See the framework in action
- **Page Objects:** `pages/` - Study the Page Object Model implementation
- **Utilities:** `utils/` - Helper functions and test data management

## 🎯 Ready to Test!

The framework handles complexity - you focus on testing! 🧪
