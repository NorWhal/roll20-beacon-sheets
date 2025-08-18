<template>
  <button
    v-if="!editing"
    class="stat-view"
    :class="{
      [`stat-view--${stat.toLowerCase()}`]: true,
      [`stat-view--active`]: statIsActive(),
    }"
    @click="rollStore.addDie(stat)"
  >
    <label
      class="stat-view__label"
      :for="`stat-view-${stat.toLowerCase()}`"
    >
      {{ label }}
    </label>
    <span
      class="stat-view__total"
      data-testid="stat-view-total"
    >
      {{ total }}
    </span>
  </button>
  <div
    v-else
    class="stat-edit"
    :class="`stat-edit--${stat.toLowerCase()}`"
  >
    <!-- For button below once modifiers are installed
      @mouseover="showTooltip = true"
      @focus="showTooltip = true"
      @blur="showTooltip = false"
      @mouseleave="showTooltip = false" -->
    <button
      ref="reference"
      class="stat-edit__label"
      :for="`stat-edit-${stat.toLowerCase()}`"
      @click="setModifyingToStat()"
    >
      {{ label }}:
    </button>
    <input
      v-model="statBase"
      class="stat-edit__base"
      type="number"
    >
    <ul
      v-if="showTooltip"
      ref="floating"
      :style="floatingStyles"
      class="modifiers-display"
      data-testid="modifiers-tooltip"
    >
      <li
        v-for="(modifier, index) in modifiers"
        :key="index"
        :data-testid="`popover-modifier-${index}`"
        class="modifiers-display__modifier-wrapper"
      >
        <div
          v-if="'operation' in modifier && modifier.value"
          class="modifiers-display__modifier-value"
          :data-testid="`popover-modifier-${index}-value`"
        >
          <span>{{ getOperationSymbol(modifier.operation) }}</span>
          <span>{{ modifier.value }}</span>
        </div>
        <div
          :data-testid="`popover-modifier-${index}-note`"
          class="modifiers-display__note"
        >
          {{ modifier.note ?? 'Custom Value' }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { MessageModifier, StatModifier } from "@/sheet/stores/statsStore/statsStore";
import type { AttributeKey, DepartmentKey } from "@/system/gameTerms";
import { offset, useFloating } from "@floating-ui/vue";
import { computed, ref } from "vue";
import { useRollStore } from "@/sheet/stores/rollStore/rollStore";
import { useStatsStore } from "@/sheet/stores/statsStore/statsStore";
import { useUIStore } from "@/sheet/stores/uiStore/uiStore";
import { isAttributeKey, isDepartmentKey } from "@/system/gameTerms";
import { getOperationSymbol } from "@/utility/getSymbols";

export interface StatInterfaceProps {
  stat: AttributeKey | DepartmentKey;
}

const props = defineProps<StatInterfaceProps>();

const uiStore = useUIStore();
const statsStore = useStatsStore();
const rollStore = useRollStore();

const editing = computed(() => {
  return uiStore.editMode;
});

const { stat } = props;

const isAttribute = isAttributeKey(stat);
const isDepartment = isDepartmentKey(stat);
const total = computed(() => statsStore[stat]);
const label = computed(() => {
  if (isAttribute)
    return statsStore.attributeFields[stat].label;
  if (isDepartment)
    return statsStore.departmentFields[stat].label;
  console.error("Stat unrecognized: ", stat);
  return "Error";
});
const modifiers = computed<(StatModifier | MessageModifier)[]>(() => {
  let statField;
  if (isAttribute) {
    statField = statsStore.attributeFields[stat];
  }
  if (isDepartment) {
    statField = statsStore.departmentFields[stat];
  }
  if (statField?.modifiers && statField.modifiers.length > 0)
    return statField.modifiers;
  return [{ note: `No ${label.value} Modifiers. Click to add some!` }];
});

const statBase = computed({
  get: () => {
    if (isAttribute)
      return statsStore.attributeFields[stat].base;
    if (isDepartment)
      return statsStore.departmentFields[stat].base;
    console.error("Stat unrecognized: ", stat);
    return -1;
  },
  set: (newValue) => {
    if (isAttribute)
      statsStore.attributeFields[stat].base = newValue ?? 0;
    if (isDepartment)
      statsStore.departmentFields[stat].base = newValue ?? 0;
  },
});

function statIsActive() {
  if (isAttribute)
    return rollStore.activeStats.attribute === stat;
  if (isDepartment)
    return rollStore.activeStats.department === stat;
  return false;
}

function setModifyingToStat() {
  uiStore.modifyingStat = stat;
}

const reference = ref(null);
const floating = ref(null);
const showTooltip = ref(false);

const { floatingStyles } = useFloating(reference, floating, {
  placement: "right",
  middleware: [offset(16)],
});
</script>

<style lang="scss">
@use '../../../common/scss/common.scss';
@use '../../../common/scss/vars.scss';

.modifiers-display {
  padding: 8px;
  background: var(--popover-background);
  max-width: 20%;
}

.stat-view {
  cursor: pointer;

  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid;
  justify-items: center;

  background: white;

  padding: 2px;

  border: 1px solid var(--primary-border-color);
  border-radius: var(--primary-border-radius);

  * {
    cursor: pointer;
  }

  &__label {
    text-transform: uppercase;
    color: var(--primary-text-color);
  }

  &__total {
    grid-column: span 1;
    width: 100%;
    box-sizing: border-box;
    text-align: center;

    border: none;
    padding: 0;

    appearance: textfield;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  }

  &--active.stat-view--active {
    background-color: var(--secondary-background-color-semi-transparent);
    color: white;

    .stat-view__label {
      color: white;
    }
  }

  $departments: "command", "conn", "engineering", "security", "medicine", "science";

  @each $dept in $departments {
    &--#{$dept} {
      border-color: var(--#{$dept});
      color: var(--#{$dept});

      .stat-view__label {
        color: var(--#{$dept})
      }

      &.stat-view--active {
        background-color: var(--#{$dept}-semi-transparent);
      }
    }
  }
}

.stat-edit {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid;

  justify-items: center;

  button {
    appearance: none;
    border: none;
    background: transparent;
  }

  &__label {
    grid-column: span 1;
    color: var(--label-color);
    width: 100%;
    text-align: right;
  }

  &__base {
    grid-column: span 1;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }

  &--command {
    border-color: var(--command);
    color: var(--command);

    .stat-edit__label {
      color: var(--command);
    }
  }

  &--conn {
    border-color: var(--conn);
    color: var(--conn);

    .stat-edit__label {
      color: var(--conn);
    }
  }

  &--engineering {
    border-color: var(--engineering);
    color: var(--engineering);

    .stat-edit__label {
      color: var(--engineering);
    }
  }

  &--security {
    border-color: var(--security);
    color: var(--security);

    .stat-edit__label {
      color: var(--security);
    }
  }

  &--medicine {
    border-color: var(--medicine);
    color: var(--medicine);

    .stat-edit__label {
      color: var(--medicine);
    }
  }

  &--science {
    border-color: var(--science);
    color: var(--science);

    .stat-edit__label {
      color: var(--science);
    }
  }
}
</style>
