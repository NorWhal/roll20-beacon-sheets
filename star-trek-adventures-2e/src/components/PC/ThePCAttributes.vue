<script setup lang="ts">
import { computed } from 'vue'
import { useUIStore } from '@/sheet/stores/uiStore/uiStore'
import StatInterfaceBlock from './StatInterface/StatInterfaceBlock.vue'

const uiStore = useUIStore()
const editMode = computed(() => uiStore.editMode ? 'edit' : 'view')
</script>

<template>
  <section
    class="stats-section attributes-section"
    :class="`stats-section--${editMode}`"
  >
    <h2>Attributes</h2>
    <StatInterfaceBlock stat-type="Attribute" />
  </section>
</template>

<style lang="scss">
  .attributes-section {
    background-color: var(--secondary-background-color);
  }
</style>
