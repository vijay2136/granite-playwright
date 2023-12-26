import { test } from "../fixtures";
import { expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import LoginPage from "../poms/login";
import CommentsPage from "../poms/comments";
import TasksPage from "../poms/tasks";

test.describe("Comments section", () => {
  let taskName: string;
  let comment: string;

  test.beforeEach(() => {
    taskName = faker.word.words({ count: 5 });
    comment = faker.lorem.sentence();
  });

  test.afterEach(async ({ page, tasksPage }) => {
    await page.goto("/");
    await page
      .getByTestId("tasks-pending-table")
      .getByRole("row", { name: taskName })
      .getByRole("cell", { name: taskName })
      .click();
    await tasksPage.deleteTaskAndVerify({ taskName });
  });

  test("should create a new comment as creator of the task", async ({
    page,
    browser,
    tasksPage,
  }) => {
    page.goto("/");

    await test.step("Step 1: Creata a task and verify", async () => {
      await tasksPage.createTaskAndVerify({ taskName, userName: "Sam Smith" });
    });

    await test.step("Step 2: Creata a comment and verify", async () => {
      await page.getByTestId("tasks-pending-table").getByText(taskName).click();
      await tasksPage.createAndVerifyComment({ comment, taskName });
    });

    await test.step("Step 3: Navigate to tasks page and verify comment count", async () => {
      await page.getByTestId("navbar-todos-page-link").click();
      tasksPage.verifyCommentCount({ taskName, count: 1 });
    });

    // new context for assignee
    const assigneeContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const assigneePage = await assigneeContext.newPage();
    const loginPage = new LoginPage(assigneePage);
    const assigneeTasksPage = new TasksPage(assigneePage);

    await test.step("Step 4: Login as the assignee", async () => {
      await assigneePage.goto("/");
      await loginPage.loginAndVerifyUser({
        email: "sam@example.com",
        password: "welcome",
        username: "Sam Smith",
      });
    });

    await test.step("Step 5: Verify comment count from assignees dashboard", async () => {
      await page.getByTestId("navbar-todos-page-link").click();
      assigneeTasksPage.verifyCommentCount({ taskName, count: 1 });
    });

    await test.step("Step 6: Verify comment content", async () => {
      await tasksPage.verifyCommentContent({ taskName, comment });
    });

    await assigneePage.close();
    await assigneeContext.close();
  });

  test("should be able to add a new comment as an assignee of a task", async ({
    browser,
    page,
    tasksPage,
  }) => {
    page.goto("/");

    await test.step("Step 1: Creata a task and verify", async () => {
      await tasksPage.createTaskAndVerify({ taskName, userName: "Sam Smith" });
    });

    // new context for assignee
    const assigneeContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const assigneePage = await assigneeContext.newPage();
    const loginPage = new LoginPage(assigneePage);
    const assigneeTasksPage = new TasksPage(assigneePage);

    await test.step("Step 2: Login as the assignee", async () => {
      await assigneePage.goto("/");
      await loginPage.loginAndVerifyUser({
        email: "sam@example.com",
        password: "welcome",
        username: "Sam Smith",
      });
    });

    await test.step("Step 3: Create a comment and verify as assignee", async () => {
      await assigneePage
        .getByTestId("tasks-pending-table")
        .getByText(taskName)
        .click();
      await assigneeTasksPage.createAndVerifyComment({ comment, taskName });
    });

    await test.step("Step 4: Navigate to tasks page and verify comment count from assignee dashboard", async () => {
      await assigneePage.getByTestId("navbar-todos-page-link").click();
      assigneeTasksPage.verifyCommentCount({ taskName, count: 1 });
    });

    await test.step("Step 5: Navigate to tasks page and verify comment count from creator dashboard", async () => {
      await page.reload();
      await page.getByTestId("navbar-todos-page-link").click();
      tasksPage.verifyCommentCount({ taskName, count: 1 });
    });

    await test.step("Step 6: Verify comment content as created user", async () => {
      await tasksPage.verifyCommentContent({ taskName, comment });
    });

    await assigneePage.close();
    await assigneeContext.close();
  });
});
