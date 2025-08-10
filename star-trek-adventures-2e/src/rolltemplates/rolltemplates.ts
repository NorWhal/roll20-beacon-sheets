import Handlebars from "handlebars";

import { when } from "./helpers/when";

import postWrapper from "./partials/postWrapper.hbs?raw";
import rollPostTemplate from "./templates/roll.hbs?raw";

Handlebars.registerPartial("postWrapper", postWrapper);
Handlebars.registerHelper("when", when);
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
    bottomBarValues: string[];
    dice?: number[];
    rollResult?: any;
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
