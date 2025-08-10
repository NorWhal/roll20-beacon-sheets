import type { Dispatch } from "@roll20-official/beacon-sdk";
import { defineStore } from "pinia";
import { reactive, ref, toRaw, watch } from "vue";
import { dispatchRef, initValues } from "@/relay/relay";
import { useMetaStore } from "../meta/metaStore";

export type GMHydrate = GMResources & {
  localSheetID: number;
};

export interface GMResources {
  momentum: number;
  threat: number;
}

export const useGMStore = defineStore("gm", () => {
  const metaStore = useMetaStore();
  const localSheetID = ref(initValues.id ?? "headless");
  const resources = reactive<GMResources>({
    momentum: 0,
    threat: 0,
  });

  const increaseThreatLevel = async (add: number) => {
    const increasedThreat: number = resources.threat + add;
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        threat: increasedThreat,
      },
    });
  };
  const reduceThreatLevel = async (sub: number) => {
    const reducedThreat: number = Math.max(resources.threat - sub, 0);
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        threat: reducedThreat,
      },
    });
  };
  const reduceMomentum = async (sub: number) => {
    const reducedMomentum: number = Math.max(resources.momentum - sub, 0);
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        momentum: reducedMomentum,
      },
    });
  };
  const increaseMomentum = async (add: number) => {
    const increasedMomentum: number = resources.momentum + add;
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        momentum: increasedMomentum,
      },
    });
  };

  watch(
    () => resources.momentum,
    async (newValue) => {
      if (localSheetID.value === initValues.sharedSettings.gmID) {
        const dispatch = toRaw(dispatchRef.value) as Dispatch;
        await dispatch.updateSharedSettings({
          settings: {
            momentum: newValue,
          },
        });
      }
    },
  );
  watch(
    () => resources.threat,
    async (newValue) => {
      if (localSheetID.value === initValues.sharedSettings.gmID) {
        const dispatch = toRaw(dispatchRef.value) as Dispatch;
        await dispatch.updateSharedSettings({
          settings: {
            threat: newValue,
          },
        });
      }
    },
  );

  const registerAsGMSheet = async () => {
    const dispatch = toRaw(dispatchRef.value) as Dispatch;
    await dispatch.updateSharedSettings({
      settings: {
        gmID: localSheetID.value,
      },
    });
    metaStore.name = "GM Sheet";
  };

  return {
    resources,
    localSheetID,
    increaseThreatLevel,
    reduceThreatLevel,
    increaseMomentum,
    reduceMomentum,
    registerAsGMSheet,
  };
});

export function updateGMResources(change: Partial<GMResources>) {
  const gmStore = useGMStore();
  console.log(gmStore.localSheetID, change);
  const { momentum = gmStore.resources.momentum, threat = gmStore.resources.threat } = change;
  Object.assign(gmStore.resources, { momentum, threat });
}
