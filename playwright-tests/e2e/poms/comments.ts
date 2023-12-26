import { Page, expect } from "@playwright/test";

interface CreateNewCommentProps {
  comment: string;
  taskName: string;
}

interface VerifyCommentCountProps {
  taskName: string;
  count: number;
}

export default class CommentsPage {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

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

  verifyCommentCount = async ({ taskName, count }: VerifyCommentCountProps) => {
    await expect(
      this.page
        .getByTestId("tasks-pending-table")
        .getByRole("row", { name: taskName })
        .getByRole("cell", { name: count })
    ).toBeVisible();
  };
}
