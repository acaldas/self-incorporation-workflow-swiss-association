export type ErrorCode = "PhaseNotFoundError";

export interface ReducerError {
  errorCode: ErrorCode;
}

export class PhaseNotFoundError extends Error implements ReducerError {
  errorCode = "PhaseNotFoundError" as ErrorCode;
  constructor(message = "PhaseNotFoundError") {
    super(message);
  }
}

export const errors = {
  UpdatePhaseStatus: { PhaseNotFoundError },

  AdvancePhase: { PhaseNotFoundError },
};
