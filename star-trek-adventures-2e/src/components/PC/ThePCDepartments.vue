<template>
  <section
    class="stats-section departments-section"
    :class="`stats-section--${editMode}`"
  >
    <h2 class="departments-section__header">
      Departments
    </h2>
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
    grid-template-areas:
      "deptHeader deptHeader deptHeader deptHeader deptHeader deptHeader"
      "command command engineering engineering medicine medicine"
      "conn conn security security science science";
    &__header {
      grid-area: deptHeader
    }
  }
  @media (max-width: 700px) {
    .departments-section {
      grid-template-areas:
        "deptHeader deptHeader deptHeader deptHeader deptHeader deptHeader"
        "command command command conn conn conn"
        "engineering engineering engineering security security security"
        "medicine medicine medicine science science science";
    }
  }
</style>
