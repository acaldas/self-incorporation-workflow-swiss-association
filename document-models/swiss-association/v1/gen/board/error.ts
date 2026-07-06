export type ErrorCode = "BoardMemberNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class BoardMemberNotFoundError extends Error implements ReducerError {
  errorCode = "BoardMemberNotFoundError" as ErrorCode;
  constructor(message = "BoardMemberNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdateBoardMember: { BoardMemberNotFoundError },

  RemoveBoardMember: { BoardMemberNotFoundError },
};
