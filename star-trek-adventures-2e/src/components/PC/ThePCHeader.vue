<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from "@headlessui/vue";
import { computed } from "vue";
import { useGMStore } from "@/sheet/stores/gmStore/gmStore";
import { useStatsStore } from "@/sheet/stores/statsStore/statsStore";
import { useUIStore } from "@/sheet/stores/uiStore/uiStore";

const gmStore = useGMStore();
const uiStore = useUIStore();
const statsStore = useStatsStore();

const editing = computed({
  get: () => uiStore.editMode,
  set: newValue => uiStore.editMode = newValue,
});
const determination = computed({
  get: () => statsStore.conditionsFields.DETERMINATION.base,
  set: newValue => statsStore.conditionsFields.DETERMINATION.base = newValue,
});
const stress = computed({
  get: () => statsStore.conditionsFields.STRESS.base,
  set: newValue => statsStore.conditionsFields.STRESS.base = newValue,
});
const maxstress = computed(() => statsStore.attributeFields.FITNESS.base);
</script>

<template>
  <header class="pc-header">
    <div class="pc-header__resource">
      <div class="pc-header__resource-display">
        Momentum: {{ gmStore.resources.momentum }}
      </div>
      <div class="pc-header__resource-display">
        Threat: {{ gmStore.resources.threat }}
      </div>
    </div>
    <div class="pc-header__resource">
      <div class="pc-header__resource-display">
        Determination:
        <input v-if="editing" v-model="determination" max="3" min="0">
        <span v-else>{{ determination }}</span>
      </div>
      <div class="pc-header__resource-display">
        Stress:
        <input v-if="editing" v-model="stress" :max="maxstress" min="0">
        <span v-else>{{ statsStore.conditionsFields.STRESS.base }} ( max {{ maxstress }} )</span>
      </div>
    </div>
    <SwitchGroup>
      <SwitchLabel>
        Edit Mode
      </SwitchLabel>
      <Switch
        v-model="editing"
        class="switch"
        :class="editing ? 'switch--enabled' : ''"
      >
        <span
          class="switch__handle"
          :class="editing ? 'switch__handle--enabled' : ''"
        />
      </Switch>
    </SwitchGroup>
  </header>
</template>

<style lang="scss">
  @use "../../common/scss/vars";
  .pc-header {
    display: flex;
    gap: 8px;
  }
  .pc-header__resource {
    margin-right: 2rem;
  }
</style>
