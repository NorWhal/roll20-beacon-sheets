import type { Character, Dispatch } from "@roll20-official/beacon-sdk";
import { r20Parse } from "../helpers/actionHelpers";

export const reroll = {
  method: async (
    props: {
      dispatch: Dispatch;
      character: Character;
      messageId?: string;
      dice?: number;
    },
    ...args: string[]
  ): Promise<void> => {
    console.log(args);
    console.log(`In reRollAll function`);
    console.log(`Reroll function arguments:`, r20Parse(args.join("")));
  },
  description: "starts a determination reroll",
};

export const reRollDie = {
  method: async (
    props: {
      dispatch: Dispatch;
      character: Character;
      messageId?: string;
      dice?: number;
    },
    ...args: string[]
  ) => {
    console.log("in reRollDie function");
    console.log("reRollDie function arguments");
  },
  description: "rerolls an individual die for a determination reroll",
};
