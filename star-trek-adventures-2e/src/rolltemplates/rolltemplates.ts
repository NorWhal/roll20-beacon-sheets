import Handlebars from "handlebars";

import { when } from "./helpers/when";

import postWrapper from "./partials/postWrapper.hbs?raw";
import rollAction from "./partials/rollAction.hbs?raw";
import rollPostTemplate from "./templates/roll.hbs?raw";

export type BarValue = {
  type: "text";
  content: string;
} | {
  type: "action";
  action: "reroll";
};

Handlebars.registerPartial("postWrapper", postWrapper);
Handlebars.registerPartial("rollAction", rollAction);
Handlebars.registerHelper("when", when);
Handlebars.registerHelper("matchBarType", (item1: BarValue["type"], item2: BarValue["type"]): boolean => {
  return item1 === item2;
});
Handlebars.registerHelper("_toInt", (str) => {
  return Number.parseInt(str, 10);
});

const postTemplates = {
  roll: Handlebars.compile(rollPostTemplate),
};

interface CommonParams {
  characterName: string;
  characterId: string;
}

interface RollPost {
  type: "roll";
  parameters: CommonParams & {
    rollTitle: string;
    bottomBarValues: BarValue[];
    dice?: number[];
    rollResult?: any;
    stringifiedResult: string;
    critRange?: number;
    complianceRange?: number;
  };
}

type AnyPostTemplate = RollPost;

export function createRollTemplate({ type, parameters }: AnyPostTemplate) {
  console.log(`Printing roll template parameters: ${JSON.stringify(parameters)}`);
  const template = postTemplates[type];
  const postTemplate = template({
    ...parameters,
  });
  return postTemplate;
}
