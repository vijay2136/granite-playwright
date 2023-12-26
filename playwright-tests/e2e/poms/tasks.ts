import { Page, expect } from "@playwright/test";

interface TaskName {
  taskName: string;
}
interface CreateNewTaskProps extends TaskName {
  userName?: string;
}

interface CreateNewCommentProps extends TaskName {
  comment: string;
}

interface VerifyCommentCountProps extends TaskName {
  count: number;
}

export default class TasksPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  createTaskAndVerify = async ({
    taskName,
    userName = "Oliver Smith",
  }: CreateNewTaskProps) => {
    await this.page.getByTestId("navbar-add-todo-link").click();
    await this.page.getByTestId("form-title-field").fill(taskName);

    await this.page.locator(".css-2b097c-container").click();
    await this.page.locator(".css-26l3qy-menu").getByText(userName).click();
    await this.page.getByTestId("form-submit-button").click();
    const taskInDashboard = this.page
      .getByTestId("tasks-pending-table")
      .getByRole("row", {
        name: new RegExp(taskName, "i"),
      });
    await taskInDashboard.scrollIntoViewIfNeeded();
    await expect(taskInDashboard).toBeVisible();
  };

  deleteTaskAndVerify = async ({ taskName }: TaskName) => {
    await this.page.getByTestId("task-delete-button").click();
    await expect(
      this.page
        .getByTestId("tasks-pending-table")
        .getByRole("row", { name: taskName })
    ).toBeHidden();
  };

  markTaskAsCompletedAndVerify = async ({
    taskName,
  }: TaskName): Promise<void> => {
    await this.page
      .getByTestId("tasks-pending-table")
      .getByRole("row", { name: taskName })
      .getByRole("checkbox")
      .click();
    const completedTaskInDashboard = this.page
      .getByTestId("tasks-completed-table")
      .getByRole("row", { name: taskName });
    await completedTaskInDashboard.scrollIntoViewIfNeeded();
    await expect(completedTaskInDashboard).toBeVisible();
  };

  starTaskAndVerify = async ({ taskName }: TaskName) => {
    const starIcon = this.page
      .getByTestId("tasks-pending-table")
      .getByRole("row", { name: taskName })
      .getByTestId("pending-task-star-or-unstar-link");
    await starIcon.click();
    await expect(starIcon).toHaveClass(/ri-star-fill/i);
    await expect(
      this.page.getByTestId("tasks-pending-table").getByRole("row").nth(1)
    ).toContainText(taskName);
  };

  createAndVerifyComment = async ({
    comment,
    taskName,
  }: CreateNewCommentProps) => {
    await this.page.getByTestId("comments-text-field").fill(comment);
    await this.page.getByTestId("comments-submit-button").click();
    await expect(this.page.getByTestId("task-comment-content")).toContainText(
      comment
    );
  };

  verifyCommentContent = async ({
    taskName,
    comment,
  }: CreateNewCommentProps) => {
    await this.page
      .getByTestId("tasks-pending-table")
      .getByText(taskName)
      .click();
    await expect(this.page.getByTestId("task-comment-content")).toContainText(
      comment
    );
  };

  verifyCommentCount = async ({ taskName, count }: VerifyCommentCountProps) => {
    await expect(
      this.page
        .getByTestId("tasks-pending-table")
        .getByRole("row", { name: taskName })
        .getByRole("cell", { name: count })
    ).toBeVisible();
  };
}
