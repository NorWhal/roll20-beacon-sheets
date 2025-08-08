import type {
  AttributeKey,
  AttributeValue,
  ConditionsKey,
  ConditionsValue,
  DepartmentKey,
  DepartmentValue,
} from '@/system/gameTerms'
import type { ModifierKey } from '@/system/logicTerms'
import { defineStore } from 'pinia'
import { computed, reactive, toRaw } from 'vue'
import {
  AttributesEnum,
  ConditionsEnum,
  DepartmentsEnum,
  isAttributeKey,
  isAttributeValue,
  isConditionsKey,
  isConditionsValue,
  isDepartmentKey,
  isDepartmentValue,
} from '@/system/gameTerms'
import { ModifierOperations } from '@/system/logicTerms'

export interface MessageModifier {
  note?: string
}

export interface StatModifier {
  operation: ModifierKey
  value: number
  note?: string
}

export interface StatField {
  label: AttributeValue | DepartmentValue | ConditionsValue
  base: number
  modifiers?: StatModifier[]
}

export type AttributeField = StatField & {
  label: AttributeValue
}
const isAttributeField = (stat: StatField): stat is AttributeField => isAttributeValue(stat.label)

export type AttributeDictionary = {
  -readonly [Key in keyof typeof AttributesEnum]: AttributeField & {
    label: (typeof AttributesEnum)[Key]
  };
}

export type DepartmentField = StatField & {
  label: DepartmentValue
}
function isDepartmentField(stat: StatField): stat is DepartmentField {
  return isDepartmentValue(stat.label)
}

export type DepartmentDictionary = {
  -readonly [Key in keyof typeof DepartmentsEnum]: DepartmentField & {
    label: (typeof DepartmentsEnum)[Key]
  };
}

export type ConditionsField = StatField & {
  label: ConditionsValue
}
function isConditionsField(stat: StatField): stat is ConditionsField {
  return isConditionsValue(stat.label)
}

export type ConditionsDictionary = {
  -readonly [Key in keyof typeof ConditionsEnum]: ConditionsField & {
    label: (typeof ConditionsEnum)[Key]
  }
}

export const useStatsStore = defineStore('stats', () => {
  const evaluateModifiers = (base: number, modifiers: StatModifier[]) => {
    let total = base
    if (modifiers && modifiers.length > 0) {
      modifiers.forEach((modifier) => {
        total = ModifierOperations[modifier.operation](total, modifier.value)
      })
    }
    return total
  }

  // #region Attributes
  const attributeFields = reactive<AttributeDictionary>({
    CONTROL: {
      label: AttributesEnum.CONTROL,
      base: 0,
    },
    DARING: {
      label: AttributesEnum.DARING,
      base: 0,
    },
    FITNESS: {
      label: AttributesEnum.FITNESS,
      base: 0,
    },
    PRESENCE: {
      label: AttributesEnum.PRESENCE,
      base: 0,
    },
    INSIGHT: {
      label: AttributesEnum.INSIGHT,
      base: 0,
    },
    REASON: {
      label: AttributesEnum.REASON,
      base: 0,
    },
  } as const)

  const calculateAttribute = (attribute: AttributeKey): number => {
    const total = attributeFields[attribute].base
    const modifiers = attributeFields[attribute].modifiers ?? []
    return evaluateModifiers(total, modifiers)
  }

  const CONTROL = computed(() => calculateAttribute('CONTROL'))
  const FITNESS = computed(() => calculateAttribute('FITNESS'))
  const PRESENCE = computed(() => calculateAttribute('PRESENCE'))
  const DARING = computed(() => calculateAttribute('DARING'))
  const INSIGHT = computed(() => calculateAttribute('INSIGHT'))
  const REASON = computed(() => calculateAttribute('REASON'))

  // #region Departments
  const departmentFields = reactive<DepartmentDictionary>({
    COMMAND: {
      label: DepartmentsEnum.COMMAND,
      base: 0,
    },
    CONN: {
      label: DepartmentsEnum.CONN,
      base: 0,
    },
    ENGINEERING: {
      label: DepartmentsEnum.ENGINEERING,
      base: 0,
    },
    SECURITY: {
      label: DepartmentsEnum.SECURITY,
      base: 0,
    },
    MEDICINE: {
      label: DepartmentsEnum.MEDICINE,
      base: 0,
    },
    SCIENCE: {
      label: DepartmentsEnum.SCIENCE,
      base: 0,
    },
  })

  const calculateDepartment = (department: DepartmentKey): number => {
    const total = departmentFields[department].base
    const modifiers = departmentFields[department].modifiers ?? []
    return evaluateModifiers(total, modifiers)
  }

  const COMMAND = computed(() => calculateDepartment('COMMAND'))
  const CONN = computed(() => calculateDepartment('CONN'))
  const ENGINEERING = computed(() => calculateDepartment('ENGINEERING'))
  const SECURITY = computed(() => calculateDepartment('SECURITY'))
  const MEDICINE = computed(() => calculateDepartment('MEDICINE'))
  const SCIENCE = computed(() => calculateDepartment('SCIENCE'))

  // region Conditions
  const conditionsFields = reactive<ConditionsDictionary>({
    DETERMINATION: {
      label: ConditionsEnum.DETERMINATION,
      base: 0,
    },
    STRESS: {
      label: ConditionsEnum.STRESS,
      base: 0,
    },
  })
  const calculateCondition = (condition: ConditionsKey): number => {
    return conditionsFields[condition].base
  }
  const DETERMINATION = computed(() => calculateCondition('DETERMINATION'))
  const STRESS = computed(() => calculateCondition('STRESS'))

  // region Hydration
  const dehydrate = () => {
    return {
      ...toRaw(attributeFields),
      ...toRaw(departmentFields),
      ...toRaw(conditionsFields),
    }
  }

  const hydrate = (hydrateStore: Record<AttributeKey | DepartmentKey | ConditionsKey, StatField>) => {
    const attributes: Partial<AttributeDictionary> = {}
    const departments: Partial<DepartmentDictionary> = {}
    const conditions: Partial<ConditionsDictionary> = {}
    for (const [key, field] of Object.entries(hydrateStore)) {
      if (isAttributeKey(key) && isAttributeField(field)) {
        (attributes[key] as AttributeDictionary[typeof key]) = field
      }
      else if (isDepartmentKey(key) && isDepartmentField(field)) {
        (departments[key] as DepartmentDictionary[typeof key]) = field
      }
      else if (isConditionsKey(key) && isConditionsField(field)) {
        (conditions[key] as ConditionsDictionary[typeof key]) = field
      }
      else {
        console.error('Invalid Stat: ', key)
        console.table(toRaw(field))
      }
    }

    Object.assign(attributeFields, attributes)
    Object.assign(departmentFields, departments)
    Object.assign(conditionsFields, conditions)
  }

  return {
    attributeFields,
    CONTROL,
    FITNESS,
    PRESENCE,
    DARING,
    INSIGHT,
    REASON,
    departmentFields,
    COMMAND,
    CONN,
    ENGINEERING,
    SECURITY,
    MEDICINE,
    SCIENCE,
    conditionsFields,
    DETERMINATION,
    STRESS,
    isAttributeField,
    isDepartmentField,
    dehydrate,
    hydrate,
  }
})
