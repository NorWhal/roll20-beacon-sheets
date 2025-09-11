import type { Dispatch } from "@roll20-official/beacon-sdk";
import type { BarValue } from "@/rolltemplates/rolltemplates";
import type { AttributeKey, DepartmentKey, RollTypesKey } from "@/system/gameTerms";
import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { dispatchRef } from "@/relay/relay";
import { createRollTemplate } from "@/rolltemplates/rolltemplates";
import { isAttributeKey, isDepartmentKey } from "@/system/gameTerms";
import { useGMStore } from "../gmStore/gmStore";
import { useMetaStore } from "../meta/metaStore";
import { useStatsStore } from "../statsStore/statsStore";

export interface ActiveStats {
  attribute?: AttributeKey;
  department?: DepartmentKey;
  determinationDice: number;
  threatDice: number;
  momentumDice: number;
  focus: string;
  complicationRange: number;
}

export type PreparedRollStats = {
  attribute: AttributeKey;
  department: DepartmentKey;
} & ActiveStats;

function checkPrepared(stats: ActiveStats): stats is PreparedRollStats {
  if (!(stats.attribute && stats.department))
    return false;
  const isValid = isAttributeKey(stats.attribute) && isDepartmentKey(stats.department);
  if (!isValid) {
    console.error(`🖖 prepared stats not vaild: ${stats.attribute} or ${stats.department} incorrect`);
  }
  return isValid;
}

export const useRollStore = defineStore("roll", () => {
  const statsStore = useStatsStore();
  const metaStore = useMetaStore();
  const gmStore = useGMStore();
  const activeName = ref("");
  const activeStats = reactive<ActiveStats>({
    determinationDice: 0,
    threatDice: 0,
    momentumDice: 0,
    focus: "",
    complicationRange: 1,
  });
  const savedRolls = reactive<Map<string, ActiveStats>>(new Map());

  const prepared = computed(() => checkPrepared(activeStats));

  const targetNumber = computed(() => {
    if (!checkPrepared(activeStats)) {
      return 0;
    }
    const keys = [statsStore[activeStats.attribute], statsStore[activeStats.department]];
    return keys.reduce((total, stat) => (total += stat), 0);
  });

  const savedRollActive = computed(() => {
    const savedRoll = savedRolls.get(activeName.value);
    if (!savedRoll)
      return false;
    let matches = true;
    for (const property in activeStats) {
      if (!(property in savedRoll) || activeStats[property as keyof ActiveStats] !== savedRoll[property as keyof ActiveStats])
        matches = false;
      if (!matches)
        break;
    }
    return matches;
  });

  const saveRoll = () => {
    if (!prepared.value)
      return;
    savedRolls.set(activeName.value, { ...activeStats });
  };

  const clearActiveStats = () => {
    delete activeStats.attribute;
    delete activeStats.department;
    activeStats.determinationDice = 0;
    activeStats.threatDice = 0;
    activeStats.momentumDice = 0;
    activeStats.focus = "";
    activeStats.complicationRange = 1;
  };

  const addFocus = async (focus: string) => {
    activeStats.focus = focus;
  };
  const addDie = async (type?: string) => {
    const determination: number = activeStats.determinationDice;
    const threat: number = activeStats.threatDice;
    const momentum: number = activeStats.momentumDice;
    const availDetermination = statsStore.DETERMINATION;
    const availMomentum = gmStore.resources.momentum;

    if (threat + momentum < 3) {
      switch (type) {
        case "determination": {
          if (determination < availDetermination)
            activeStats.determinationDice++;
          else console.error(`Not enough determination dice`);
          break;
        }
        case "momentum": {
          if (momentum < availMomentum)
            activeStats.momentumDice++;
          else console.error(`Not enough momentum dice`);
          break;
        }
        case "threat": {
          activeStats.threatDice++;
          break;
        }
        default: {
          if (!type) {
            console.error("No type declared in addDie");
          }
          else if (isAttributeKey(type)) {
            activeStats.attribute = type as AttributeKey;
          }
          else if (isDepartmentKey(type)) {
            activeStats.department = type as DepartmentKey;
          }
        }
      }
    }
  };

  type RollClass = "critical-success" | "determination" | "complication" | "success" | "no-crit";

  /** Used by the rolltemplate to show each individual die */
  interface RollResult {
    /** The actual result */
    roll: number;
    /** Discarded rolls from determination rerolls */
    discards?: number[];
    /** Whether the template should display the result as a crit-success/fumble */
    class: RollClass;
  }

  interface RollParseContext {
    dice?: number[];
    target: number;
    critRange: number;
    /** @Done @todo actually implement this */
    complicationRange?: number;
    determinationDice?: number;
  }

  /**
   * @param ctx The target number, whether a focus is applied, and
   * @returns the information needed to show numbers in the rolltemplate
   */
  const parseRollResults = (ctx: RollParseContext): { rollResult: RollResult[]; successes: number; complications: number } => {
    const { dice = [], target, critRange, complicationRange, determinationDice } = ctx;
    const results: RollResult[] = [];
    let successes = 0;
    let complications = 0;
    let determination = determinationDice || 0;
    dice.forEach((roll) => {
      console.log(`Roll: ${JSON.stringify(roll)}, Determination: ${JSON.stringify(determination)}, `);
      const rollSucceeded = roll <= target;
      const rollComplication = roll > (20 - Number(complicationRange));
      let critClass: RollClass;
      switch (true) {
        case determination > 0 :
          roll = 1;
          critClass = "determination";
          successes = successes + 2;
          determination--;
          break;
        case roll === 1:
        case roll <= critRange && rollSucceeded:
          critClass = "critical-success";
          successes = successes + 2;
          break;
        case roll <= target:
          critClass = "success";
          successes++;
          break;
        case roll === 20:
        case rollComplication:
          critClass = "complication";
          complications++;
          break;
        default:
          critClass = "no-crit";
      }

      /* Replaced with logic in the switch cases
       if (rollSucceeded) {
        successes += critClass === 'critical-success' ? 2 : 1;
      } */

      results.push({
        roll,
        discards: [14, 12],
        class: critClass,
      });
    });
    console.log(`Roll results: ${JSON.stringify({
      rollResult: results,
      successes,
      complications,
    })}`);

    return {
      rollResult: results,
      successes,
      complications,
    };
  };

  const doRoll = async (rollType: RollTypesKey) => {
    if (!prepared.value)
      return;
    const dispatch: Dispatch = dispatchRef.value;

    // Focus and Criticals
    const attributeLevel: number = activeStats.attribute ? statsStore[activeStats.attribute] : 0;
    const departmentLevel: number = activeStats.department ? statsStore[activeStats.department] : 0;
    const focusApplied = activeStats.focus.length > 0;
    const target = attributeLevel + departmentLevel;
    const critRange: number = focusApplied ? departmentLevel : 1;
    const complRange: number = activeStats.complicationRange;

    // Setup roll string and roll
    const baseDice = rollType === "TASK" ? 2 : 1;
    const determination = (activeStats.determinationDice > Number(statsStore.DETERMINATION)) ? Number(statsStore.DETERMINATION) : activeStats.determinationDice;
    console.log(`Determination: ${determination}`);
    const dice = baseDice + activeStats.threatDice + activeStats.momentumDice;
    console.table({ dice, baseDice, threatDice: activeStats.threatDice, momentumDice: activeStats.momentumDice, targetNumber: targetNumber.value, critRange });
    console.log(dispatch);
    const { results } = await dispatch.roll({
      rolls: {
        roll: `${dice}d20<${targetNumber.value}cs<${1 + critRange}`,
      },
    });

    const { rollResult, successes, complications } = parseRollResults({
      dice: results.roll.results.dice,
      critRange,
      complicationRange: complRange,
      target,
      determinationDice: determination,
    });
    // console.log(`Roll result array: ${JSON.stringify(rollResult)}`)

    // Create rolltemplate
    const bottomBarValues: BarValue[] = [
      { type: "text", content: `${dice}d20 ≤ ${target}` },
      { type: "text", content: `Successes: ${successes}` },
      { type: "text", content: `Complications: ${complications}` },
      { type: "action", action: "reroll" },
    ];
    if (focusApplied)
      bottomBarValues.unshift(activeStats.focus);
    console.log(`Roll results: ${JSON.stringify(results)}`);
    const content = createRollTemplate({
      type: "roll",
      parameters: {
        characterId: metaStore.id,
        ...activeStats,
        rollTitle: `${activeStats.attribute} + ${activeStats.department}`,
        bottomBarValues,
        dice: results.roll.results.dice,
        critRange,
        // complRange: complRange,
        rollResult,
        stringifiedResult: JSON.stringify(rollResult),
        characterName: metaStore.name,
      },
    });

    // Reduce the Determination and Increase Threat
    statsStore.conditionsFields.DETERMINATION.base = statsStore.DETERMINATION - determination;
    gmStore.resources.threat = gmStore.resources.threat + activeStats.threatDice;

    // Post the rolltemplate to chat
    // console.log(`Roll content: ${JSON.stringify(content)}`);
    dispatch.post({
      content,
    });
  };

  const handleSavedRollClick = (clickedRollName: string) => {
    const clickedRoll = savedRolls.get(clickedRollName);
    if (activeName.value === clickedRollName && savedRollActive.value) {
      doRoll();
      return;
    }
    activeName.value = clickedRollName;
    Object.assign(activeStats, { ...clickedRoll });
  };

  const dehydrate = () => {
    const rolls: Record<string, ActiveStats> = {};
    for (const [name, roll] of savedRolls.entries()) {
      rolls[name] = roll;
    }
    return { rolls };
  };

  interface RollHydrate {
    rolls: Record<string, ActiveStats>;
  }

  const hydrate = (hydrateStore: RollHydrate) => {
    savedRolls.clear();
    console.log(hydrateStore.rolls);
    for (const entry of Object.entries(hydrateStore.rolls)) {
      savedRolls.set(...entry);
    }
  };

  return {
    activeName,
    activeStats,
    savedRolls,
    savedRollActive,
    saveRoll,
    doRoll,
    addDie,
    addFocus,
    handleSavedRollClick,
    clearActiveStats,
    dehydrate,
    hydrate,
  };
});
