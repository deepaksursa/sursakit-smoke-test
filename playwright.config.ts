import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Playwright Configuration - Chrome Only for Basic Testing
 * Simplified configuration focusing on essential functionality
 */
export default defineConfig({
  // Test directory configuration
  testDir: './tests',
  
  // Global test timeout (10 minutes)
  timeout: 10 * 60 * 1000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10000,
  },

  // Retry configuration for flaky tests
  retries: process.env.CI ? 2 : 0,
  
  // Parallel execution workers
  workers: process.env.CI ? 2 : undefined,
  
  // Simple HTML reporter only
  reporter: [
    ['html', { outputFolder: 'reports', open: 'never' }],
    ['list']
  ],

  // Global test configuration
  use: {
    // Base URL for navigation
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Browser configuration
    headless: process.env.HEADLESS === 'true',
    
    // Video recording
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    
    // Screenshot on failure
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    // Trace collection
    trace: {
      mode: 'retain-on-failure',
      screenshots: true,
      snapshots: true
    },
    
    // Navigation timeout (reduced for local)
    navigationTimeout: 15000,
    
    // Action timeout (reduced for local)
    actionTimeout: 5000,
  },

  // Test projects - Chrome Only
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // All outputs go to test-results folder
  outputDir: 'test-results/',
}); 