<template>
  <StatInterface
    v-for="(stat, key) in stats"
    :key
    :stat="stat"
  />
</template>

<script setup lang="ts">
import type { AttributeKey, DepartmentKey } from "@/system/gameTerms";
import { computed } from "vue";
import { AttributeKeys, DepartmentKeys } from "@/system/gameTerms";
import StatInterface from "./StatInterface.vue";

export interface StatInterfaceBlockProps {
  statType: "Attribute" | "Department";
}

const props = defineProps<StatInterfaceBlockProps>();

const { statType } = props;

const stats = computed<AttributeKey[] | DepartmentKey[]> (() => {
  switch (statType) {
    case "Attribute":
      return AttributeKeys;
    case "Department":
      return DepartmentKeys;
  }
  return [];
});
</script>

<style>

</style>
