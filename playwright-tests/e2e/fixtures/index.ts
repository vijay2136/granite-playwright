import { test as base } from "@playwright/test";
import LoginPage from "../poms/login";
import TasksPage from "../poms/tasks";
interface ExtendedFixtures {
  loginPage: LoginPage;
  tasksPage: TasksPage;
}

export const test = base.extend<ExtendedFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  tasksPage: async ({ page }, use) => {
    const tasksPage = new TasksPage(page);
    await use(tasksPage);
  },
});
