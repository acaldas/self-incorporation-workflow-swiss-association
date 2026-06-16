import type { SwissAssociationMultisigOperations } from "document-models/swiss-association/v1";

export const swissAssociationMultisigOperations: SwissAssociationMultisigOperations =
  {
    setMultisigConfigOperation(state, action) {
      state.multisig = {
        platform: action.input.platform,
        address: action.input.address,
        keysTotal: action.input.keysTotal,
        decisionQuorum: action.input.decisionQuorum,
        privateChannel: action.input.privateChannel || null,
        availabilityThreshold: action.input.availabilityThreshold || null,
        internalPolicyLink: action.input.internalPolicyLink || null,
        multisigDate: action.input.multisigDate || null,
        emergencyProcedures: action.input.emergencyProcedures || null,
      };
    },
  };
