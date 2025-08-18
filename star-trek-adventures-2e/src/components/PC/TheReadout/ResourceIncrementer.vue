<template>
  <div class="readout__entry readout__entry--resource">
    <label class="readout__resource-state-label" :for="`${resource}-resource-state`">
      <span v-if="isComplRange">{{ resource }}</span>
      <span v-else>{{ resource }} Dice:</span>
    </label>
    <button class="readout__resource-button" :disabled="!decrementAllowed" @click="decrement">
      <span v-if="isComplRange" class="sr-only">Decrease {{ resource }}</span>
      <span v-else class="sr-only">Decrease {{ resource }} Dice</span>
      <img
        v-if="decrementAllowed"
        src="../../../common/assets/remove.svg"
        role="presentation"
      >
      <img
        v-else
        src="../../../common/assets/blocked.svg"
        role="presentation"
      >
    </button>
    <input :id="`${resource}-resource-state`" class="readout__resource-state" type="number" disabled :value="model">
    <button class="readout__resource-button" :disabled="!incrementAllowed" @click="increment">
      <span
        class="sr-only"
      >
        Add {{ resource }} Die
      </span>
      <img
        v-if="incrementAllowed"
        src="../../../common/assets/add.svg"
        role="presentation"
      >
      <img
        v-else
        src="../../../common/assets/blocked.svg"
        role="presentation"
      >
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ResourcesValue, RollModifiersValue } from "@/system/gameTerms";
import { computed } from "vue";
import { isComplicationRange } from "@/system/gameTerms";

export interface ResourceIncrementerProps {
  resource: ResourcesValue | RollModifiersValue;
}
const props = defineProps<ResourceIncrementerProps>();
const model = defineModel<number>({ required: true });

const isComplRange = isComplicationRange(props.resource);

const minDecrement = isComplRange ? 1 : 0;
const decrementAllowed = computed(() => model.value > minDecrement);
function decrement() {
  if (decrementAllowed.value)
    model.value--;
}

const maxIncrement = isComplRange ? 5 : 3;
const incrementAllowed = computed(() => model.value < maxIncrement);
function increment() {
  if (incrementAllowed.value)
    model.value++;
}
</script>

<style scoped lang="scss">
  @use "../../../sheet/scss/generics.scss" as generics;
  .readout {
    &__entry--resource {
      grid-template-columns: min-content 1fr 1fr min-content;

      gap: 2px;
      width: max-content;
      justify-items: center;

      input[type=number] {
        grid-column: span 2;
        width: 100%;

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        -moz-appearance: textfield;
        appearance: textfield;

        text-align: center;
      }
    }
    &__resource-state-label {
      @include generics.nowrap-label;
      grid-column: span 4;
    }
    &__resource-button {
      display: flex;
      justify-content: center;
      img {
        height: 16px;
        line-height: 0;
      }

      &:disabled {
        cursor: not-allowed;
      }
    }
  }
  @media (max-width: 420px) {
    .readout{
      &__entry--resource {
        input[type=number] {
          grid-column: 1/-1;
          grid-row: 2;
        }
      }
      &__resource-button {
        grid-column: span 2;
        width: 100%
      }
    }
  }
</style>
