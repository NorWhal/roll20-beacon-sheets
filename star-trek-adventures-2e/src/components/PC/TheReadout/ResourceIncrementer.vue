<template>
  <div class="readout__entry readout__entry--resource">
    <label class="readout__resource-state-label" :for="`${resource}-resource-state`">
      <span>{{ resource }} Dice:</span>
    </label>
    <button class="readout__resource-button" :disabled="!decrementAllowed" @click="decrement">
      <span class="sr-only">Decrease {{ resource }} Dice</span>
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
import { ResourcesValue } from '@/system/gameTerms';
import { computed } from 'vue';

export type ResourceIncrementerProps = {
  resource: ResourcesValue;
}
defineProps<ResourceIncrementerProps>();
const model = defineModel<number>({required: true});

const decrementAllowed = computed(() => model.value > 0)
const decrement = () => {
  if (decrementAllowed.value) model.value--;
}

const incrementAllowed = computed(() => model.value < 3)
const increment = () => {
  if (incrementAllowed.value) model.value++;
}

</script>

<style scoped lang="scss">
  .readout {
    &__entry--resource {
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;

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