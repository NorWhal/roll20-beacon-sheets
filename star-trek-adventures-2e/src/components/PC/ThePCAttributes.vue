<template>
  <section
    class="stats-section attributes-section"
    :class="`stats-section--${editMode}`"
  >
    <h2>Attributes</h2>
    <StatInterfaceBlock stat-type="Attribute" />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUIStore } from "@/sheet/stores/uiStore/uiStore";
import StatInterfaceBlock from "./StatInterface/StatInterfaceBlock.vue";

const uiStore = useUIStore();
const editMode = computed(() => uiStore.editMode ? "edit" : "view");
</script>

<style lang="scss">
  .attributes-section {
    background-color: var(--secondary-background-color);
    grid-template-areas:
      "attrHeader attrHeader attrHeader attrHeader attrHeader attrHeader"
      "control control presence presence insight insight"
      "fitness fitness daring daring reason reason";
    &__header {
      grid-area: attrHeader
    }
  }
  @media (max-width: 700px) {
    .attributes-section {
      grid-template-areas:
        "attrHeader attrHeader attrHeader attrHeader attrHeader attrHeader"
        "control control control fitness fitness fitness"
        "presence presence presence daring daring daring"
        "insight insight insight reason reason reason";
    }
  }
</style>
