import type { SwissAssociationWorkflowOperations } from "document-models/swiss-association/v1";
import { PhaseNotFoundError } from "../../gen/workflow/error.js";

export const swissAssociationWorkflowOperations: SwissAssociationWorkflowOperations =
  {
    updatePhaseStatusOperation(state, action) {
      const phase = state.phases.find(
        (p) => p.phaseNumber === action.input.phaseNumber,
      );
      if (!phase)
        throw new PhaseNotFoundError(
          `Phase ${action.input.phaseNumber} not found`,
        );
      phase.status = action.input.status;
      if (
        action.input.documentsGenerated !== undefined &&
        action.input.documentsGenerated !== null
      )
        phase.documentsGenerated = action.input.documentsGenerated;
      if (
        action.input.documentsSigned !== undefined &&
        action.input.documentsSigned !== null
      )
        phase.documentsSigned = action.input.documentsSigned;
      if (action.input.completedDate)
        phase.completedDate = action.input.completedDate;
    },
    advancePhaseOperation(state, action) {
      const current = state.phases.find(
        (p) => p.phaseNumber === state.currentPhase,
      );
      if (!current)
        throw new PhaseNotFoundError(
          `Current phase ${state.currentPhase} not found`,
        );
      current.status = "COMPLETE";
      current.completedDate = action.input.completedDate;
      const next = state.phases.find(
        (p) => p.phaseNumber === (state.currentPhase ?? 0) + 1,
      );
      if (next) {
        next.status = "IN_PROGRESS";
        state.currentPhase = next.phaseNumber;
      }
    },
    addNoteOperation(state, action) {
      state.customNotes.push(action.input.note);
    },
  };
