interface UserCredentials {
  username: string;
  password: string;
}

interface TestUsers {
  validUser: UserCredentials;
  invalidUser: UserCredentials;
}

interface TestData {
  organizationName: string;
  workspaceName: string;
  serviceName: string;
  fileName: string;
}

export const TestCredentials: TestUsers = {
  validUser: {
    username: process.env.TEST_USERNAME || "test@example.com",
    password: process.env.TEST_PASSWORD || "password123",
  },

  invalidUser: {
    username: "invalid@example.com",
    password: "wrongpassword",
  },
};

export const testData: TestData = {
  organizationName: "Test Organization",
  workspaceName: "Test Worksapce",
  serviceName: "Test Service",
  fileName: "File.ts",
};

export const TestConfig = {
  timeouts: {
    default: 30000,
    navigation: 15000,
    action: 5000,
  },

  urls: {
    base: process.env.BASE_URL || "https://uat.sursakit.com",
    login: "/auth/sign-in",
    dashboard: "/dashboard",
  },
};

export const getTestUser = (
  type: "valid" | "invalid" = "valid"
): UserCredentials => {
  return type === "valid"
    ? TestCredentials.validUser
    : TestCredentials.invalidUser;
};

export const validateCredentials = (): boolean => {
  const { username, password } = TestCredentials.validUser;
  return username !== "test@example.com" && password !== "password123";
};
