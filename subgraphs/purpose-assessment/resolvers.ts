import { type ISubgraph } from "@powerhousedao/reactor-api";
import { assessPurpose } from "./lib.js";

export const getResolvers = (_subgraph: ISubgraph): Record<string, unknown> => {
  return {
    Query: {
      assessPurpose: async (_parent: unknown, args: { text: string }) => {
        return assessPurpose(args.text);
      },
    },
  };
};
