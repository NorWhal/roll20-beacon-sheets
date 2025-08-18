import type { Character, Dispatch } from "@roll20-official/beacon-sdk";

export const startReRoll = {
  method: async (
    props: {
      dispatch: Dispatch;
      character: Character;
      messageId?: string;
      dice?: number;
    },
    ...args: string[]
  ): Promise<void> => {
    console.log(`In reRollAll function`);
    console.log(`Reroll function arguments:`, args);
    const [diceString] = args;
    const dice = diceString.split(",");
    const checkboxes = dice.map((die, index) => `<div class="form-check"><input type="checkbox" class="form-check-input" id="die-${index}>"<label class="form-check-label" for="die-${index}">${die}</label></div>`).join("\n");
    const queryResults = await props.dispatch.query({
      options: {
        title: "ReRoll",
        html: checkboxes,
      },
    });
  },
};
