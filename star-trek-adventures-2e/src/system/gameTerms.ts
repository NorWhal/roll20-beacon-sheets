type EnumKey<E> = keyof E;
type EnumVal<E> = E[keyof E];

// region Attributes
export const AttributesEnum = {
  CONTROL: "Control",
  FITNESS: "Fitness",
  PRESENCE: "Presence",
  DARING: "Daring",
  INSIGHT: "Insight",
  REASON: "Reason",
} as const;

export type AttributeKey = EnumKey<typeof AttributesEnum>;
export const AttributeKeys = Object.keys(AttributesEnum) as AttributeKey[];
export const isAttributeKey = (key: string): key is AttributeKey => key in AttributesEnum;

export type AttributeValue = EnumVal<typeof AttributesEnum>;
export const AttributeValues = Object.values(AttributesEnum) as AttributeValue[];
export const isAttributeValue = (value: string): value is AttributeValue => AttributeValues.includes(value as AttributeValue);

// region Departments
export const DepartmentsEnum = {
  COMMAND: "Command",
  ENGINEERING: "Engineering",
  MEDICINE: "Medicine",
  CONN: "Conn",
  SECURITY: "Security",
  SCIENCE: "Science",
} as const;

export type DepartmentKey = EnumKey<typeof DepartmentsEnum>;
export const DepartmentKeys = Object.keys(DepartmentsEnum) as DepartmentKey[];
export const isDepartmentKey = (key: string): key is DepartmentKey => key in DepartmentsEnum;

export type DepartmentValue = (typeof DepartmentsEnum)[DepartmentKey];
export const DepartmentValues = Object.values(DepartmentsEnum) as DepartmentValue[];
export const isDepartmentValue = (value: string): value is DepartmentValue => DepartmentValues.includes(value as DepartmentValue);

// region Conditions
/** Stats dealing with the current meta state of an individual character */
export const ConditionsEnum = {
  DETERMINATION: "Determination",
  STRESS: "Stress",
} as const;
export type ConditionsKey = EnumKey<typeof ConditionsEnum>;
export const ConditionsKeys = Object.keys(ConditionsEnum) as ConditionsKey[];
export const isConditionsKey = (key: string): key is ConditionsKey => key in ConditionsEnum;

export type ConditionsValue = EnumVal<typeof ConditionsEnum>;
export const ConditionsValues = Object.values(ConditionsEnum) as ConditionsValue[];
export const isConditionsValue = (value: string): value is ConditionsValue => ConditionsValues.includes(value as ConditionsValue);

// region Resources
/** Stats dealing with the current meta state of the scene/party */
export const ResourcesEnum = {
  THREAT: "Threat",
  MOMENTUM: "Momentum",
} as const;
export type ResourcesKey = EnumKey<typeof ResourcesEnum>;
export const ResourcesKeys = Object.keys(ResourcesEnum) as ResourcesKey[];
export const isResourcesKey = (key: string): key is ResourcesKey => key in ResourcesEnum;

export type ResourcesValue = EnumVal<typeof ResourcesEnum>;
export const ResourcesValues = Object.values(ResourcesEnum) as ResourcesValue[];
export const isResourcesValue = (value: string): value is ResourcesValue => ResourcesValues.includes(value as ResourcesValue);

// region Rolls
/** Stats dealing with the current meta state of the scene/party */
export const RollModifiersEnum = {
  COMPLICATIONRANGE: "Complication range",
  DETERMINATIONDICE: "Determination",
} as const;
export type RollModifiersKey = EnumKey<typeof RollModifiersEnum>;
export const RollModifiersKeys = Object.keys(RollModifiersEnum) as RollModifiersKey[];
export const isRollModifiersKey = (key: string): key is RollModifiersKey => key in RollModifiersEnum;
export type RollModifiersValue = (typeof RollModifiersEnum)[RollModifiersKey];
export const RollModifiersValues = Object.values(RollModifiersEnum) as RollModifiersValue[];
export const isRollModifiersValue = (value: string): value is RollModifiersValue => RollModifiersValues.includes(value as RollModifiersValue);
export const isComplicationRange = (value: string): value is typeof RollModifiersEnum.COMPLICATIONRANGE => value === RollModifiersEnum.COMPLICATIONRANGE;
export const isDeterminationDice = (value: string): value is typeof RollModifiersEnum.DETERMINATIONDICE => value === RollModifiersEnum.DETERMINATIONDICE;

export const RollTypesEnum = {
  TASK: "Task",
  ASSIST: "Assist",
} as const;

export type RollTypesKey = EnumKey<typeof RollTypesEnum>;
export const RollTypesKeys = Object.keys(RollTypesEnum) as RollTypesKey[];
export const isRollTypesKey = (key: string): key is RollTypesKey => key in RollTypesEnum;

export type RollTypesValue = EnumVal<typeof RollTypesEnum>;
export const RollTypesValues = Object.values(RollTypesEnum) as RollTypesValue[];
export const isRollTypesValue = (key: string): key is RollTypesValue => RollTypesValues.includes(key as RollTypesValue);

// region Advancement
const AdvancementTypesEnum = {
  LOG: "Log",
  MILESTONE: "Milestone",
  ARC: "Arc",
} as const;

export type AdvancementTypeKey = EnumKey<typeof AdvancementTypesEnum>;
export const AdvancementTypeKeys = Object.keys(AdvancementTypesEnum) as AdvancementTypeKey[];
export const isAdvancementTypeKey = (key: string): key is AdvancementTypeKey => AdvancementTypeKeys.includes(key as AdvancementTypeKey);

export type AdvancementTypeValue = EnumVal<typeof AdvancementTypesEnum>;
export const AdvancementTypeValues = Object.values(AdvancementTypesEnum) as AdvancementTypeValue[];
export const isAdvancementTypeValue = (value: string): value is AdvancementTypeValue => AdvancementTypeValues.includes(value as AdvancementTypeValue);

/** How values can be invoked, per Milestone entry directions (CRB p. 166) */
const ValueInvocationsEnum = {
  POSITIVE: "+",
  NEGATIVE: "-",
  CHALLENGE: "!",
} as const;

export type ValueInvocationKey = EnumKey<typeof ValueInvocationsEnum>;
export const ValueInvocationKeys = Object.keys(ValueInvocationsEnum) as ValueInvocationKey[];
export const isValueInvocationKey = (key: string): key is ValueInvocationKey => ValueInvocationKeys.includes(key as ValueInvocationKey);

export type ValueInvocationValue = EnumVal<typeof ValueInvocationsEnum>;
export const ValueInvocationValues = Object.values(ValueInvocationsEnum) as ValueInvocationValue[];
export const isValueInvocationValue = (value: string): value is ValueInvocationValue => ValueInvocationValues.includes(value as ValueInvocationValue);
