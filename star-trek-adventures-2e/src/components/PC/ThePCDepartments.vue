<template>
  <section
    class="stats-section departments-section"
    :class="`stats-section--${editMode}`"
  >
    <h2>Departments</h2>
    <StatInterfaceBlock stat-type="Department" />
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
  .departments-section {
    background-color: var(--tertiary-background-color);
  }
</style>
