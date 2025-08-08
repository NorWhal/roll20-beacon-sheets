export type GMAttr = 'momentum' | 'threat'

function getMomentum(character: any) {
  const gmHydrate = character.character.attributes.gm
  return gmHydrate.momentum
}
function getThreat(character: any) {
  const gmHydrate = character.character.attributes.gm
  return gmHydrate.threat
}

export function gmAttrs() {
  const attrs: Partial<
    Record<GMAttr, { get: (character: any) => number, tokenBarValue?: boolean }>
  > = {}
  attrs.momentum = {
    get: character => getMomentum(character),
    tokenBarValue: false,
  }
  attrs.threat = {
    get: character => getThreat(character),
    tokenBarValue: false,
  }
  return attrs
}
