<template>
  <section
    class="readout"
    :class="{
      'readout--active': formStarted,
    }"
  >
    <div class="readout__header-bar">
      <h2 class="readout__header">
        Task Manager
      </h2>
      <TheReadoutCarousel />
      <button
        v-if="formStarted"
        type="reset"
        class="readout__clear-button"
        title="Clear Task"
        @click="clearReadout"
      >
        <TrashIcon class="button-svg button-svg--lg" />
      </button>
    </div>
    <div
      v-if="formStarted"
      class="readout__button-col"
    >
      <label
        v-if="formStarted"
        class="readout__entry readout__entry--name"
      >
        <span>Name</span>
        <input
          v-model="rollStore.activeName"
          type="text"
        >
      </label>
      <button
        v-if="rollStore.savedRollActive"
        type="reset"
        @click="deleteSavedRoll"
      >
        Delete Roll
      </button>
      <button
        v-else
        class="readout__save-button"
        @click="rollStore.saveRoll"
      >
        <StarIcon class="button-svg button-svg--md" />
        <span> Save </span>
      </button>
    </div>
    <span
      v-if="!formStarted"
      class="readout__prompt"
    >
      Click an Attribute, Department, or Focus to start a roll!
    </span>
    <div
      v-else
      class="readout__entries"
    >
      <label
        v-if="formStarted"
        class="readout__entry"
      >
        <span>Attribute</span>
        <input
          v-if="attribute"
          type="text"
          disabled
          :value="AttributesEnum[attribute]"
        >
        <span
          v-else-if="formStarted"
          class="readout__empty"
        >
          Choose Attribute!
        </span>
      </label>
      <label
        v-if="formStarted"
        class="readout__entry"
      >
        <span>Department</span>
        <input
          v-if="department"
          type="text"
          disabled
          :value="DepartmentsEnum[department]"
        >
        <span
          v-else-if="formStarted"
          class="readout__empty"
        >
          Choose Department!
        </span>
      </label>
      <label
        v-if="showFocus && formStarted"
        class="readout__entry"
      >
        <span>Focus</span>
        <input
          ref="focus-input"
          v-model="focus"
          type="text"
          autofocus
        >
      </label>
      <button
        v-else-if="formStarted"
        class="readout__entry readout__entry--toggle"
        @click="toggleFocus"
      >
        <AddIcon class="button-svg button-svg--md" />
        <span> Focus </span>
      </button>
    </div>
    <div
      v-if="formStarted"
      class="readout__button-col"
    >
      <button
        class="readout__roll-button"
        @click="rollStore.doRoll('TASK')"
      >
        Roll
      </button>
      <button
        class="readout__roll-button"
        @click="rollStore.doRoll('ASSIST')"
      >
        Assist
      </button>
      <!-- <button
        class="readout__add-button"
        @click="rollStore.addDie('determination')"
      >
        <img
          src="../../../common/assets/add.svg"
          role="presentation"
        >
        <span> Determination </span>
      </button> -->
    </div>
    <div
      class="readout__modifiers"
    >
      <ResourceIncrementer
        v-if="formStarted"
        v-model="rollStore.activeStats.momentumDice"
        resource="Momentum"
      />
      <ResourceIncrementer
        v-if="formStarted"
        v-model="rollStore.activeStats.threatDice"
        resource="Threat"
      />
      <ResourceIncrementer
        v-if="formStarted"
        v-model="rollStore.activeStats.determinationDice"
        resource="Determination"
      />
      <ResourceIncrementer
        v-if="formStarted"
        v-model="rollStore.activeStats.complicationRange"
        resource="Complication range"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ActiveStats } from "@/sheet/stores/rollStore/rollStore";
import type { AttributeKey, DepartmentKey } from "@/system/gameTerms";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import AddIcon from "@/common/assets/add.svg?component";
import TrashIcon from "@/common/assets/delete.svg?component";
import StarIcon from "@/common/assets/star.svg?component";
import { useRollStore } from "@/sheet/stores/rollStore/rollStore";
import { AttributesEnum, DepartmentsEnum } from "@/system/gameTerms";
import ResourceIncrementer from "./ResourceIncrementer.vue";
import TheReadoutCarousel from "./TheReadoutCarousel.vue";

const rollStore = useRollStore();

function readStat(stat: keyof ActiveStats) {
  const value = rollStore.activeStats[stat];
  return value;
}

const attribute = computed(() =>
  readStat("attribute") as AttributeKey | undefined,
);
const department = computed(() =>
  readStat("department") as DepartmentKey | undefined,
);

const showFocus = ref(false);

const focus = computed({
  get() {
    return rollStore.activeStats.focus;
  },
  set(value: string) {
    rollStore.activeStats.focus = value;
  },
});

watch(focus, (newValue) => {
  if (newValue.length && !showFocus.value) {
    showFocus.value = true;
  }
  else if (!newValue.length) {
    showFocus.value = false;
  }
});

const formStarted = computed<boolean>(() => {
  const state = Boolean(attribute.value || department.value || focus.value);
  return state;
});

const showModiferEntries = ref(false);

watch(formStarted, (newValue) => {
  if (!newValue)
    showModiferEntries.value = false;
});

const focusInput = useTemplateRef("focus-input");
function toggleFocus() {
  showFocus.value = !showFocus.value;
  if (showFocus.value) {
    nextTick(() => focusInput.value?.focus());
  }
}

function clearReadout() {
  rollStore.clearActiveStats();
  showFocus.value = false;
}

function deleteSavedRoll() {
  rollStore.savedRolls.delete(rollStore.activeName);
  clearReadout();
}
</script>

<style lang="scss">
  @use "@/common/scss/common" as common;

  .readout {
    display: grid;
    grid-column: span 12;
    grid-row: span 4;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;

    border: 1px solid var(--secondary-border-color);
    border-radius: var(--primary-border-radius);
    padding: 4px;

    &__entries {
      display: grid;
      grid-column: 3 / 11;
      grid-row: span 2;
      grid-template-columns: repeat(6,1fr);
      gap: var(--secondary-gap);
    }
    &__modifiers {
      grid-column: 1/-1;
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      justify-content: space-between;
      gap: var(--primary-gap);
    }

    button {
      cursor: pointer;
    }

    &__empty,
    &__entry {
      grid-row: span 2;
    }

    &__empty,
    &__entry {
      grid-column: span 2;
    }

    &__empty {
      display:flex;
      grid-column: span 3;

      justify-content: center;
      align-content: center;
    }

    &__entry {
      display: grid;

      grid-template-columns: subgrid;
      grid-template-rows: subgrid;

      span {
        grid-column: span 2;
        font-size: .75rem;
      }

      input {
        width: 100%;
        box-sizing: border-box;
        grid-column: span 2;
        font-family: var(--common-font);
      }

      &--toggle {
        @include common.button;
        display: flex;
        justify-content: center;
        align-items: center;
        img {
          height: 16px;
        }
      }
      &--name {
        grid-template-rows: none;
        grid-row: unset;
      }
    }

    &__header-bar {
      grid-column: span 12;
      display: grid;
      grid-template-columns: max-content min-content 1fr min-content min-content;
      align-items: center;
      gap: 4px;
      height: 24px;
    }

    &__header,
    &__prompt {
      display: flex;
      height: var(--subsection-header-size);
      font-size: var(--subsection-header-size);
      line-height: var(--subsection-header-size);
      margin: 0;
    };

    &__header {
      justify-content: flex-start;
      color: var(--primary-text-color)
    }

    &__prompt {
      grid-column: span 12;
      justify-content: center;
    }

    &__save-button {
      display: inline-flex;
      justify-content: center;
      img {
        height: 0.75rem;
        aspect-ratio: 1;
        align-self: center;
        margin-right: 0.125rem;
      }
    }

    &__add-button {
      @include common.button;
      display: inline-flex;
      justify-content: center;
      img {
        height: 0.75rem;
        align-self: center;
        aspect-ratio: 1;
        margin-right: 0.125rem;
      }
    }

    &__button-col {
      display: grid;
      grid-template-rows: subgrid;
      grid-row: span 2;
      grid-column: span 2;
      & span {
        font-size: 0.75rem;
      }

      * {
        display: grid;
        grid-column: span 2;
        grid-template-columns: subgrid;
      }

      button {
        @include common.button;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
    }

    &__clear-button {
      @include common.svg-button(1.5rem);
      border: 0;
    }
  }

  @media screen and (max-width: 550px) {
    .readout {
      &__entries {
        grid-column: 3/-3;
        grid-template-columns: 1fr;
      }
      &__entry {
        span,
        input {
          grid-column: span 1;
        }
        grid-column: span 1;
        width: min-content;
      }
    }
  }
</style>
