import Handlebars from "handlebars";

import rollPostTemplate from "./templates/roll.hbs?raw"

import postWrapper from "./partials/postWrapper.hbs?raw"
import { when } from './helpers/when';

Handlebars.registerPartial("postWrapper", postWrapper)
Handlebars.registerHelper('when', when);
Handlebars.registerHelper('_toInt', function(str) {
  return parseInt(str,10);
});

const postTemplates = {
  roll: Handlebars.compile(rollPostTemplate)
}

type CommonParams = {
  characterName: string;
  characterId: string;
}

type RollPost = {
  type: "roll",
  parameters: CommonParams & {
    rollTitle: string,
    bottomBarValues: string[],
    dice?: number[],
    rollResult?: any,
    critlevel?: number,
  }
};

type AnyPostTemplate = RollPost;

export const createRollTemplate = ({type, parameters}: AnyPostTemplate) => {
  const template = postTemplates[type];
  const postTemplate = template({
    ...parameters
  })
  return postTemplate;
}