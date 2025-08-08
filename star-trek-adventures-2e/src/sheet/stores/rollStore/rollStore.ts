import { isAttributeKey, AttributesEnum, isDepartmentKey, type AttributeKey, type DepartmentKey, isDeterminationDice } from '@/system/gameTerms';
import { defineStore } from 'pinia';
import { computed, type ComputedRef, reactive, ref, toRaw } from 'vue';
import { useStatsStore } from '../statsStore/statsStore';
import { useGMStore } from '../gmStore/gmStore';
import { dispatchRef } from '@/relay/relay';
import { type Dispatch } from '@roll20-official/beacon-sdk';
import { createRollTemplate } from '@/rolltemplates/rolltemplates';
import { useMetaStore } from '../meta/metaStore';

export type ActiveStats = {
  baseDice: number;
  attribute?: AttributeKey;
  department?: DepartmentKey;
  determinationDice: number;
  threatDice: number;
  momentumDice: number;
  focus: string;
  complicationRange: number;
};

export type PreparedRollStats = {
  attribute: AttributeKey;
  department: DepartmentKey;
} & ActiveStats;

const checkPrepared = (stats: ActiveStats): stats is PreparedRollStats => {
  if (!(stats.attribute && stats.department)) return false;
  const isValid = isAttributeKey(stats.attribute) && isDepartmentKey(stats.department);
  if (!isValid) {
    console.error(`🖖 prepared stats not vaild: ${stats.attribute} or ${stats.department} incorrect`);
  }
  return isValid;
};

export const reRollAll = async (props: any) => {
  console.log(`Attempted a Reroll - functionality is work in progress! With props: ${JSON.stringify(props)}`);
};

export const useRollStore = defineStore('roll', () => {
  const statsStore = useStatsStore();
  const metaStore = useMetaStore();
  const gmStore = useGMStore();
  const activeName = ref('');
  const activeStats = reactive<ActiveStats>({
    baseDice: 0,
    determinationDice: 0,
    threatDice: 0,
    momentumDice: 0,
    focus: '',
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

  const savedRollActive = computed(() => savedRolls.has(activeName.value) && JSON.stringify(activeStats) === JSON.stringify(savedRolls.get(activeName.value)));

  const saveRoll = () => {
    if (!prepared.value) return;
    savedRolls.set(activeName.value, { ...activeStats });
  };

  const clearActiveStats = () => {
    delete activeStats.attribute;
    delete activeStats.department;
    activeStats.baseDice = 0;
    activeStats.determinationDice = 0;
    activeStats.threatDice = 0;
    activeStats.momentumDice = 0;
    activeStats.focus = '';
    activeStats.complicationRange = 1;
  };

  const addFocus = async (focus: string) => {
    activeStats.focus = focus;
    console.log(`Added focus: ${activeStats.focus}`);
  };
  const addDie = async (type?: string) => {
    const base: number = activeStats.baseDice,
      determination: number = activeStats.determinationDice,
      threat: number = activeStats.threatDice,
      momentum: number = activeStats.momentumDice,
      availDetermination = statsStore.DETERMINATION,
      availMomentum = gmStore.resources.momentum;
    console.log(`Base: ${base}, determination: ${determination}, 
                threat: ${threat}, momentum: ${momentum}, 
                five? ${base + determination + threat + momentum < 5}`);
    if (base + threat + momentum < 5) {
      switch (type) {
        case 'determination': {
          console.log(`Adding determination die`);
          if (determination < availDetermination) activeStats.determinationDice++;
          else console.log(`Not enough determination dice`);
          break;
        }
        case 'momentum': {
          console.log(`Adding momentum die`);
          if (momentum < availMomentum) activeStats.momentumDice++;
          else console.log(`Not enough momentum dice`);
          break;
        }
        case 'threat': {
          console.log(`Adding threat die`);
          activeStats.threatDice++;
          break;
        }
        default: {
          if (isAttributeKey(String(type))) {
            console.log(`Adding attribute ${type}`);
            activeStats.attribute = type as AttributeKey;
            activeStats.baseDice = activeStats.department ? 2 : 1;
          }
          if (isDepartmentKey(String(type))) {
            console.log(`Adding department ${type}`);
            activeStats.department = type as DepartmentKey;
            activeStats.baseDice = activeStats.attribute ? 2 : 1;
          }
          console.log(`Adding another type of die`);
        }
      }
    }
  };

  type RollClass = 'critical-success' | 'determination' | 'complication' | 'success' | 'no-crit';

  /** Used by the rolltemplate to show each individual die */
  type RollResult = {
    /** The actual result */
    roll: number;
    /** Whether the template should display the result as a crit-success/fumble */
    class: RollClass;
  };

  type RollParseContext = {
    dice?: number[];
    target: number;
    critRange: number;
    /**@Done @todo actually implement this */
    complicationRange?: number;
    determinationDice?: number;
  };

  /**
   * @param ctx The target number, whether a focus is applied, and
   * @returns the information needed to show numbers in the rolltemplate
   */
  const parseRollResults = (ctx: RollParseContext): { rollResult: RollResult[]; successes: number; complications: number } => {
    const { dice = [], target, critRange, complicationRange, determinationDice } = ctx;
    const results: RollResult[] = [];
    let successes = 0,
        complications = 0,
        determination = determinationDice || 0;
    dice.forEach((roll) => {
      console.log(`Roll: ${JSON.stringify(roll)}, Determination: ${JSON.stringify(determination)}, `)
      const rollSucceeded = roll <= target;
      const rollComplication = roll > (20 - Number(complicationRange));
      let critClass: RollClass;
      switch (true) {
        case determination > 0 :
          roll = 1;
          critClass = 'determination';
          successes = successes + 2;
          determination--;
          break;
        case roll === 1:
        case roll <= critRange && rollSucceeded:
          critClass = 'critical-success';
          successes = successes + 2;
          break;
        case roll <= target:
          critClass = 'success';
          successes++;
          break;
        case roll === 20:
        case rollComplication:
          critClass = 'complication';
          complications++;
          break;
        default:
          critClass = 'no-crit';
      }

      /* Replaced with logic in the switch cases
       if (rollSucceeded) {
        successes += critClass === 'critical-success' ? 2 : 1;
      } */

      results.push({
        roll: roll,
        class: critClass,
      });
    });
    console.log(`Roll results: ${JSON.stringify({
      rollResult: results,
      successes,
      complications
    })}`);

    return {
      rollResult: results,
      successes,
      complications
    };
  };

  const doRoll = async () => {
    if (!prepared.value) return;
    const dispatch: Dispatch = dispatchRef.value;

    // Focus and Criticals
    const attributeLevel: number = activeStats.attribute ? statsStore[activeStats.attribute] : 0;
    const departmentLevel: number = activeStats.department ? statsStore[activeStats.department] : 0;
    const focusApplied = activeStats.focus.length > 0;
    const target = attributeLevel + departmentLevel;
    const critRange: number = focusApplied ? departmentLevel : 1;
    const complRange: number = activeStats.complicationRange; 

    // Setup roll string and roll
    const determination = (activeStats.determinationDice > Number(statsStore.DETERMINATION)) ? Number(statsStore.DETERMINATION) : activeStats.determinationDice;
    console.log(`Determination: ${determination}`);
    const dice = activeStats.baseDice + activeStats.threatDice + activeStats.momentumDice;
    const { results } = await dispatch.roll({
      rolls: {
        roll: `${dice}d20<${targetNumber.value}cs<${1 + critRange}`,
      },
    });

    const { rollResult, successes, complications } = parseRollResults({ dice: results.roll.results.dice, critRange: critRange, complicationRange: complRange, target, determinationDice: determination });
    //console.log(`Roll result array: ${JSON.stringify(rollResult)}`)

    // Create rolltemplate
    const bottomBarValues = [`${dice}d20 ≤ ${target}`, `Successes: ${successes}`, `Complications: ${complications}`];
    if (focusApplied) bottomBarValues.unshift(activeStats.focus);
    console.log(`Roll results: ${JSON.stringify(results)}`);
    const content = createRollTemplate({
      type: 'roll',
      parameters: {
        characterId: metaStore.id,
        ...activeStats,
        rollTitle: `${activeStats.attribute} + ${activeStats.department}`,
        bottomBarValues,
        dice: results.roll.results.dice,
        critRange: critRange,
        //complRange: complRange,
        rollResult: rollResult,
        characterName: metaStore.name,
      },
    });

    // Reduce the Determination and Increase Threat
    statsStore.conditionsFields.DETERMINATION.base = statsStore.DETERMINATION - determination;
    gmStore.resources.threat = gmStore.resources.threat + activeStats.threatDice;

    // Post the rolltemplate to chat
    //console.log(`Roll content: ${JSON.stringify(content)}`);
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

  type RollHydrate = {
    rolls: Record<string, ActiveStats>;
  };

  const hydrate = (hydrateStore: RollHydrate) => {
    savedRolls.clear();
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
