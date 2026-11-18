import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./fullstack",
  globalSetup: "./fullstack/setup.ts",
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
