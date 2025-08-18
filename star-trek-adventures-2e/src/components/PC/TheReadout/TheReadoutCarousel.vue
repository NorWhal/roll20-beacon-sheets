<template>
  <aside
    class="quick-roll-carousel"
  >
    <button
      v-if="contentsOverflow"
      class="quick-roll-carousel__scroll quick-roll-carousel__scroll--left"
      :disabled="position === 0"
      @click="position = position - 1"
    >
      <LeftArrow />
    </button>
    <div
      ref="carousel"
      class="quick-roll-carousel__wrapper"
      :class="{
        'quick-roll-carousel__wrapper--no-buttons': !contentsOverflow,
      }"
    >
      <div
        ref="contents"
        class="quick-roll-carousel__contents"
      >
        <button
          v-for="key, index in rollStore.savedRolls.keys()"
          :id="`quick-roll-item-${index}`"
          :key="key"
          class="quick-roll-carousel__saved-roll-button"
          :class="{
            'readout__saved-roll-button--active': rollStore.savedRollActive && key === rollStore.activeName,
          }"
          @click="rollStore.handleSavedRollClick(key)"
        >
          {{ key }}
        </button>
      </div>
    </div>
    <button
      v-if="contentsOverflow"
      class="quick-roll-carousel__scroll quick-roll-carousel__scroll--right"
      :disabled="!overflowingItemsRemain"
      @click="position = position + 1"
    >
      <RightArrow />
    </button>
  </aside>
</template>

<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import LeftArrow from "@/common/assets/arrow_left.svg?component";
import RightArrow from "@/common/assets/arrow_right.svg?component";
import { useRollStore } from "@/sheet/stores/rollStore/rollStore";

const rollStore = useRollStore();

const carousel = useTemplateRef("carousel");
const { width: carouselWidth } = useElementSize(carousel);

const contents = useTemplateRef("contents");
const { width: contentsWidth } = useElementSize(contents);

const contentsOverflow = computed(() => {
  return contentsWidth.value >= carouselWidth.value;
});

const itemCount = ref(0);

const itemWidths = computed(() => {
  const items = itemCount.value;
  // eslint-disable-next-line unicorn/new-for-builtins
  const indexes = [...Array(items).keys()];
  const widths = indexes.map((index) => {
    const id = `quick-roll-item-${index}`;
    const item = document.getElementById(id);
    const itemRect = item?.getBoundingClientRect();
    return itemRect?.width ?? 0;
  });
  return widths;
});

const _position = ref(0);

const remainingItemsWidth = computed(() => {
  const remainingItems = itemWidths.value.slice(_position.value);
  return remainingItems.reduce((prev, current) => prev + current + 4, 0);
});
const overflowingItemsRemain = computed(() => {
  const remain = remainingItemsWidth.value > carouselWidth.value;
  return remain;
});

const position = computed({
  get: () => _position.value,
  set: (newIndex: number) => {
    const itemCount = rollStore.savedRolls.size;
    switch (true) {
      case newIndex < 0:
        _position.value = 0;
        break;
      case newIndex > itemCount - 1:
        _position.value = itemCount - 1;
        break;
      case newIndex < position.value:
      case overflowingItemsRemain.value:
        _position.value = newIndex;
    }
  },
});

watch(contentsOverflow, (newValue) => {
  if (!newValue)
    position.value = 0;
});

watch(() => rollStore.savedRolls.size, (newValue) => {
  itemCount.value = newValue;
  position.value = 0;
});

onMounted(() => {
  itemCount.value = rollStore.savedRolls.size;
});

const positionInPx = computed(() => {
  const itemsToShiftBy = itemWidths.value.slice(0, position.value);
  const pixels = itemsToShiftBy.reduce((prev, current) => prev + current + 4, 0);
  return `-${pixels}px`;
});
</script>

<style scoped lang="scss">
  @use "@/common/scss/common" as common;

  .quick-roll-carousel {
    grid-column: span 3;
    display: grid;
    grid-template-columns: subgrid;
    height: 100%;

    &__wrapper {
      width: 100%;
      overflow: hidden;
      position: relative;

      &--no-buttons {
        grid-column: span 3;
      }
    }

    &__contents {
      position: absolute;
      width: max-content;
      display: flex;
      flex-wrap: nowrap;
      gap: 4px;

      transition: left 0.2s;

      left: v-bind(positionInPx);
    }

    &__saved-roll-button {
      @include common.button;
      height: 1.5rem;
      width: max-content;
    }

    &__scroll {
      @include common.svg-button(1.5rem);
    }
  }
</style>
