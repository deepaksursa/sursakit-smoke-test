/**
 * 📦 Test User Storage
 *
 * Manages storage and retrieval of test user credentials
 * Saves users created during signup tests for reuse in other tests
 *
 * Lifecycle:
 * - During test execution: Users are saved in-memory and can be used across tests
 * - After all tests complete: Memory is automatically cleared (garbage collected)
 * - Data persists only during the current test run (same process)
 *
 * Note: Uses in-memory storage for better performance and simplicity.
 * Data is lost if the test process crashes, but this is acceptable for test execution.
 */

export interface SavedTestUser {
  email: string;
  password: string;
  name: string;
  createdAt: string;
  verified: boolean;
}

/**
 * In-memory storage for test users
 * This array persists during the test execution and is cleared when process ends
 */
const testUsersStorage: SavedTestUser[] = [];

/**
 * Read all saved test users from memory
 */
export function getSavedTestUsers(): SavedTestUser[] {
  return [...testUsersStorage]; // Return copy to prevent external mutations
}

/**
 * Save a new test user to in-memory storage
 */
export function saveTestUser(
  email: string,
  password: string,
  name: string,
  verified: boolean = false
): void {
  // Check if user already exists
  const existingIndex = testUsersStorage.findIndex((u) => u.email === email);
  const newUser: SavedTestUser = {
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
    verified,
  };

  if (existingIndex >= 0) {
    // Update existing user
    testUsersStorage[existingIndex] = newUser;
    console.log(`✅ Updated test user: ${email}`);
  } else {
    // Add new user
    testUsersStorage.push(newUser);
    console.log(`✅ Saved test user: ${email}`);
  }
}

/**
 * Get a specific test user by email
 */
export function getTestUserByEmail(email: string): SavedTestUser | undefined {
  return testUsersStorage.find((u) => u.email === email);
}

/**
 * Get all verified test users
 */
export function getVerifiedTestUsers(): SavedTestUser[] {
  return testUsersStorage.filter((u) => u.verified === true);
}

/**
 * Mark a user as verified
 */
export function markUserAsVerified(email: string): void {
  const user = testUsersStorage.find((u) => u.email === email);
  if (user) {
    user.verified = true;
    console.log(`✅ Marked user as verified: ${email}`);
  } else {
    console.warn(`⚠️ User not found for verification: ${email}`);
  }
}

/**
 * Get the most recently created test user
 */
export function getLatestTestUser(): SavedTestUser | undefined {
  if (testUsersStorage.length === 0) return undefined;

  // Sort by creation date (newest first)
  // Create a copy to avoid mutating the original array
  const sorted = [...testUsersStorage].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return sorted[0];
}

/**
 * Get a random verified test user
 */
export function getRandomVerifiedUser(): SavedTestUser | undefined {
  const verified = getVerifiedTestUsers();
  if (verified.length === 0) return undefined;

  const randomIndex = Math.floor(Math.random() * verified.length);
  return verified[randomIndex];
}

/**
 * Clear all saved test users from memory
 * Note: This is optional since memory is cleared when process ends
 * Useful for explicit cleanup during test execution
 */
export function clearAllTestUsers(): void {
  testUsersStorage.length = 0; // Clear array efficiently
  console.log("✅ Cleared all saved test users from memory");
}
