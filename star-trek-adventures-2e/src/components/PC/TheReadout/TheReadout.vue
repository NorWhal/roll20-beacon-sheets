<template>
  <section 
    class="readout"
    :class="{
      'readout--active': formStarted
    }"
  >
    <h2 class="readout__header">
      Task Manager
    </h2>
    <aside class="readout__quick-roll-bar">
      <div
        v-for="key in rollStore.savedRolls.keys()"
        :key="key"
      >
        <button 
          :class="{
            'readout__saved-roll-button': true,
            'readout__saved-roll-button--active': rollStore.savedRollActive && key === rollStore.activeName,
          }"
          @click="rollStore.handleSavedRollClick(key)"
        > 
          {{ key }} 
        </button>
      </div>
    </aside>
    <div 
      v-if="formStarted"
      class="readout__button-col"
    >
      <button 
        type="reset"
        class="readout__clear-button"
        @click="clearReadout"
      >
        Clear
      </button>
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
        class="readout__save-button"
        @click="rollStore.saveRoll"
      >
        <img
          src="../../../common/assets/star.svg"
          role="presentation"
        >
        <span> Save </span>
      </button>
      <button 
        v-if="rollStore.savedRollActive"
        type="reset"
        @click="deleteSavedRoll"
      >
        Delete Roll
      </button>
    </div>
    <div class="readout__entries">
      <span 
        v-if="!formStarted"
        class="readout__prompt"
      >
        Click an Attribute, Department, or Focus to start a roll!
      </span>
      
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
          type="text"
          autofocus
          v-model="focus"     
        >
      </label>
      <button 
        v-else-if="formStarted"
        class="readout__entry readout__entry--toggle"
        @click="toggleFocus"
      >
        <img
          src="../../../common/assets/add.svg"
          role="presentation"
        >
        <span> Focus </span>
      </button>
      <ResourceIncrementer
        v-if="formStarted"
        resource="Momentum"
        v-model="rollStore.activeStats.momentumDice"
      />
      <ResourceIncrementer
        v-if="formStarted"
        resource="Threat"
        v-model="rollStore.activeStats.threatDice"
      />
      <ResourceIncrementer
        v-if="formStarted"
        resource="Determination"
        v-model="rollStore.activeStats.determinationDice"
      />
      <ResourceIncrementer
        v-if="formStarted"
        resource="Complication range"
        v-model="rollStore.activeStats.complicationRange"
      />
      <!-- <label 
        v-if="formStarted"
        class="readout__entry"
      >
        <span>Determination</span>
        <input
          type="text"
          disabled
          :value="determination"
        >
      </label> -->
          
    </div>
    <div 
      v-if="formStarted"
      class="readout__button-col"
      >
      <button
        class="readout__roll-button"
        @click="rollStore.doRoll()"
      >
        Roll 
      </button>
      <span
        class="readout__dice"
        v-if="formStarted"        
      >
        Dice: 
        {{ diceCounter }}
      </span>
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
  </section>
</template>

<script setup lang="ts">
import { type ActiveStats, useRollStore } from '@/sheet/stores/rollStore/rollStore';
import { AttributeKey, AttributesEnum, DepartmentKey, DepartmentsEnum } from '@/system/gameTerms';
import { computed, ref, watch, useTemplateRef, nextTick } from 'vue';
import ResourceIncrementer from './ResourceIncrementer.vue';

const rollStore = useRollStore()

const readStat = (stat: keyof ActiveStats) => {
  const value = rollStore.activeStats[stat]
  return value
}

const attribute = computed(() => 
  readStat("attribute") as AttributeKey | undefined
)
const department = computed(() => 
  readStat("department") as DepartmentKey | undefined
)

const showFocus = ref(false);

const focus = computed({
  get() {
    return rollStore.activeStats.focus
  },
  set(value: string) {
    rollStore.activeStats.focus = value
  }
})

watch(focus, (newValue) => {
  if (newValue.length && !showFocus.value) {
    showFocus.value = true;
  } else if (!newValue.length) {
    showFocus.value = false;
  }
})

const diceCounter = computed(() => {
  return rollStore.activeStats.baseDice + 
          rollStore.activeStats.threatDice + 
          rollStore.activeStats.momentumDice;
});

const formStarted = computed(() => {
  const state = (attribute.value || department.value || focus.value);
  return state;
})

const focusInput = useTemplateRef("focus-input");
const toggleFocus = () => {
  showFocus.value = !showFocus.value;
  if (showFocus.value) {
    nextTick(() => focusInput.value?.focus()) 
  }
}

const clearReadout = () => {
  rollStore.clearActiveStats();
  showFocus.value = false;
}

const deleteSavedRoll = () => {
  rollStore.savedRolls.delete(rollStore.activeName)
  clearReadout();
}
</script>

<style lang="scss">
  .readout {
    display: grid;
    grid-column: span 12;
    grid-row: span 6;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;

    &__entries {
      display: grid;
      grid-column: 3 / 11;
      grid-row: span 2;
      grid-template-columns: repeat(6,1fr);
      gap: 2px;
    }

    button {
      cursor: pointer;
      width: 100%;
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
      }

      &--toggle {
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
    

    &__header,
    &__prompt {
      display: flex;
      font-size: var(--subsection-header-size);
      line-height: var(--subsection-header-size);
      margin: 0;
    };

    &__header {
      grid-column: span 3;
      justify-content: flex-start;
    }

    &__prompt {
      grid-column: span 12;
      justify-content: center;
    }

    &__quick-roll-bar {
      grid-column: span 9;
      display: flex;
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
      grid-row: span 3;
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
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }
    }

    &__clear-button {
      &:last-child{
        grid-row: 1/1;
      }
    }
  }
</style>