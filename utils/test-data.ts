/**
 * Test Data Configuration
 *
 * Why TypeScript format?
 * ✅ Environment variable integration (process.env)
 * ✅ Type safety and IntelliSense
 * ✅ Fallback values for safety
 * ✅ Complex data structures
 * ✅ Comments and documentation
 * ✅ Multiple test scenarios
 */

// Type definitions for better structure
interface UserCredentials {
  username: string;
  password: string;
}

interface TestUsers {
  validUser: UserCredentials;
  invalidUser: UserCredentials;
  // Future: adminUser, guestUser, etc.
}

// Test Credentials - Uses environment variables with fallbacks
export const TestCredentials: TestUsers = {
  validUser: {
    username: process.env.TEST_USERNAME || "test@example.com",
    password: process.env.TEST_PASSWORD || "password123",
  },

  invalidUser: {
    username: "invalid@example.com",
    password: "wrongpassword",
  },

  // Future test users can be added here:
  // adminUser: { ... },
  // guestUser: { ... },
};

// Test Configuration
export const TestConfig = {
  timeouts: {
    default: 30000,
    navigation: 15000,
    action: 5000,
  },

  urls: {
    base: process.env.BASE_URL || "http://localhost:5173",
    login: "/auth/sign-in",
    dashboard: "/dashboard",
  },

  // Future: API endpoints, test data sets, etc.
};

// Helper functions (only possible in .ts)
export const getTestUser = (
  type: "valid" | "invalid" = "valid"
): UserCredentials => {
  return type === "valid"
    ? TestCredentials.validUser
    : TestCredentials.invalidUser;
};

// Validation helper
export const validateCredentials = (): boolean => {
  const { username, password } = TestCredentials.validUser;
  return username !== "test@example.com" && password !== "password123";
};
