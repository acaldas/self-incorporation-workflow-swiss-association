export type ErrorCode = "MemberNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class MemberNotFoundError extends Error implements ReducerError {
  errorCode = "MemberNotFoundError" as ErrorCode;
  constructor(message = "MemberNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateMember: { MemberNotFoundError },
  RemoveMember: { MemberNotFoundError },
};
