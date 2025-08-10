import type { InitArgs, SharedSettingsChangeArgs } from "@roll20-official/beacon-sdk";
import { updateGMResources } from "@/sheet/stores/gmStore/gmStore";
import { beaconPulse, initValues } from "../relay";

// onInit is called when the Relay is first loaded. It is used to set up the initial values of the sheet.
export function onInit({ character, settings, sharedSettings, compendiumDropData }: InitArgs) {
  initValues.id = character.id;
  initValues.character = character;
  initValues.settings = settings;
  initValues.sharedSettings.momentum = sharedSettings.momentum ?? 0;
  initValues.sharedSettings.threat = sharedSettings.threat ?? 0;
  initValues.sharedSettings.gmID = sharedSettings.gmID;
  initValues.compendiumDrop = compendiumDropData || null;
  console.log("onInit -> ST:Adventures 2e Relay");
}

// onChange is called when the character data is updated. This is where you will update the sheet with the new data.
export async function onChange({ character }: { character: Record<string, any> }) {
  const old = beaconPulse.value; // This is a way to trigger a re-render of the sheet, see relay.ts for more information.
  beaconPulse.value = old + 1;
  console.log("onChange -> ST:Adventures 2e Relay", character);
}

export function onSettingsChange() {}

export function onSharedSettingsChange(change: SharedSettingsChangeArgs) {
  if (initValues.id !== initValues.sharedSettings.gmID) {
    updateGMResources(change.settings);
  }
}

export const onTranslationsRequest = () => ({});

export function onDragOver() {}
