export const REVIEW_STATUS = {
  PENDING: "Pending",
  ANNOTATING: "Annotating",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
