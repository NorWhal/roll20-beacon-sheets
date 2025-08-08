<template>
  <div class="readout__entry readout__entry--resource">
    <label class="readout__resource-state-label" :for="`${resource}-resource-state`">
      <span v-if="isComplRange">{{ resource }}</span>
      <span v-else>{{ resource }} Dice:</span>
    </label>
    <button class="readout__resource-button" :disabled="!decrementAllowed" @click="decrement">
      <span class="sr-only" v-if="isComplRange">Decrease {{ resource }}</span>
      <span class="sr-only" v-else>Decrease {{ resource }} Dice</span>
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
    <input class="readout__resource-state" type="number" disabled :id="`${resource}-resource-state`" :value="model">
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
import { ResourcesValue, RollModifiersValue, RollModifiersValues, isComplicationRange } from '@/system/gameTerms';
import { computed } from 'vue';

export type ResourceIncrementerProps = {
  resource: ResourcesValue | RollModifiersValue;
}
const props = defineProps<ResourceIncrementerProps>();
const model = defineModel<number>({required: true});

const isComplRange = isComplicationRange(props.resource);

const minDecrement = isComplRange ? 1 : 0;
const decrementAllowed = computed(() => model.value > minDecrement)
const decrement = () => {
  if (decrementAllowed.value) model.value--;
}

const maxIncrement = isComplRange ? 5 : 3; 
const incrementAllowed = computed(() => model.value < maxIncrement)
const increment = () => {
  if (incrementAllowed.value) model.value++;
}

</script>

<style scoped lang="scss">
  .readout {
    &__entry--resource {
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      grid-column: span 3;

      input[type=number] {
        grid-column: span 1;
        
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
      grid-column: span 3;
      text-transform: capitalize;
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
</style>