export type ErrorCode =
  | "DuplicateContributorAgreementError"
  | "ContributorAgreementNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class DuplicateContributorAgreementError
  extends Error
  implements ReducerError
{
  errorCode = "DuplicateContributorAgreementError" as ErrorCode;
  constructor(message = "DuplicateContributorAgreementError") {
    super(message);
  }
}

export class ContributorAgreementNotFoundError
  extends Error
  implements ReducerError
{
  errorCode = "ContributorAgreementNotFoundError" as ErrorCode;
  constructor(message = "ContributorAgreementNotFoundError") {
    super(message);
  }
}

export const errors = {
  AddContributorAgreement: { DuplicateContributorAgreementError },

  UpdateContributorAgreement: { ContributorAgreementNotFoundError },

  RemoveContributorAgreement: { ContributorAgreementNotFoundError },

  SetContributorAgreementMarkdown: { ContributorAgreementNotFoundError },

  MarkContributorAgreementSigned: { ContributorAgreementNotFoundError },
};
