import { isAttributeKey, AttributesEnum, isDepartmentKey, type AttributeKey, type DepartmentKey } from "@/system/gameTerms";
import { defineStore } from "pinia";
import { computed, type ComputedRef, reactive, ref, toRaw } from "vue";
import { useStatsStore } from "../statsStore/statsStore";
import { useGMStore } from "../gmStore/gmStore";
import { dispatchRef } from "@/relay/relay";
import { type Dispatch } from "@roll20-official/beacon-sdk";
import { createRollTemplate } from "@/rolltemplates/rolltemplates";
import { useMetaStore } from "../meta/metaStore";

export type ActiveStats = {
  baseDice: number;
  attribute?: AttributeKey;
  department?: DepartmentKey;
  determinationDice: number;
  threatDice: number;
  momentumDice: number;
  focus: string;
  traits?: string[];
  talents?: string[];
}

export type PreparedRollStats = {
  attribute: AttributeKey;
  department: DepartmentKey;
} & ActiveStats;


const checkPrepared = (stats: ActiveStats): stats is PreparedRollStats => {
  if (!(stats.attribute && stats.department)) return false;
  const isValid = (isAttributeKey(stats.attribute) && isDepartmentKey(stats.department))
  if (!isValid) {
    console.error(`🖖 prepared stats not vaild: ${stats.attribute} or ${stats.department} incorrect`)
  }
  return isValid
}

export const reRollAll = async (props:any) => {
  console.log(`Attempted a Reroll - functionality is work in progress! With props: ${JSON.stringify(props)}`);
};

export const useRollStore = defineStore("roll", () => {
  const statsStore = useStatsStore();
  const metaStore = useMetaStore();
  const gmStore = useGMStore();
  const activeName = ref("");
  const activeStats = reactive<ActiveStats>({
    baseDice:0,
    determinationDice:0,
    threatDice:0,
    momentumDice:0,
    focus:''});
  const savedRolls = reactive<Map<string, ActiveStats>>(new Map)

  const prepared = computed(() => checkPrepared(activeStats))

  const targetNumber = computed(() => {
    if (!checkPrepared(activeStats)) {
      return 0;
    }
    const keys = [
      statsStore[activeStats.attribute],
      statsStore[activeStats.department],
    ]
    return keys.reduce((total, stat) => total += stat, 0)
  });

  const savedRollActive = computed(() => 
    savedRolls.has(activeName.value)
    && JSON.stringify(activeStats) === JSON.stringify(savedRolls.get(activeName.value))
)

  const saveRoll = () => {
    if (!prepared.value) return;
    savedRolls.set(activeName.value, {...activeStats});
  };

  const clearActiveStats = () => {
    delete activeStats.attribute
    delete activeStats.department
    activeStats.determinationDice = 0;
    activeStats.threatDice = 0;
    activeStats.momentumDice = 0;
    activeStats.focus = '';
    activeStats.traits = [];
    activeStats.talents = [];
  }

  const addFocus = async (focus:string) => {
    activeStats.focus = focus;
    console.log(`Added focus: ${activeStats.focus}`);
  }
  const addDie = async (type?:string) => {
    const base:number = activeStats.baseDice,
          determination:number = activeStats.determinationDice,
          threat:number = activeStats.threatDice,
          momentum:number = activeStats.momentumDice,
          availDetermination = statsStore.DETERMINATION,
          availMomentum = gmStore.resources.momentum;
    console.log(`Base: ${base}, determination: ${determination}, 
                threat: ${threat}, momentum: ${momentum}, 
                five? ${base + determination + threat + momentum < 5}`);
    if ( base + determination + threat + momentum < 5 ) {
      switch (type) {
        case ("determination") : {
          console.log(`Adding determination die`);
          if( determination < availDetermination )
            activeStats.determinationDice++;
          else 
            console.log(`Not enough determination dice`);
          break;
        } 
        case ("momentum") : {
          console.log(`Adding momentum die`);
          if( momentum < availMomentum )
            activeStats.momentumDice++;
          else 
            console.log(`Not enough momentum dice`);
          break;
        } 
        case ("threat") : {        
          console.log(`Adding threat die`);
          activeStats.threatDice++;
          break;
        }
        default : {        
          if (isAttributeKey(String(type))) {
            console.log(`Adding attribute ${type}`);
            activeStats.attribute = type as AttributeKey;
            activeStats.baseDice = 
              (activeStats.department) ? 2 : 1;
          }       
          if (isDepartmentKey(String(type))) {
            console.log(`Adding department ${type}`);
            activeStats.department = type as DepartmentKey;
            activeStats.baseDice = 
              (activeStats.attribute) ? 2 : 1;            
          }
          console.log(`Adding another type of die`);
        }
      }
    }
  } 

  const doRoll = async () => {
    if (!prepared.value) return;
    const dispatch: Dispatch = dispatchRef.value

    // Focus and Criticals
    const departmentLevel:number = (activeStats.department) ? Number(statsStore.departmentFields[activeStats.department].base) : 0;
    //console.log(`Department level : ${departmentLevel} ${typeof departmentLevel}`);
    const crit:number = activeStats.focus && activeStats.focus.length > 0 ? (1+departmentLevel) : 1; 
    //console.log(`Crits are less or equal to ${crit}`);
    
    // Setup roll string
    if ( activeStats.determinationDice > Number(statsStore.DETERMINATION) ) return; 
    const dice = activeStats.baseDice +
                activeStats.determinationDice +
                activeStats.threatDice +
                activeStats.momentumDice; 
    const {results} = await dispatch.roll({rolls: {
      "roll": `${dice}d20<${targetNumber.value}cs<${1+crit}`}})

    // Prepare for rolltemplate and classes for crit success and faileur
    type RollResult = { roll: number; class: string; }  
    const rollResult:RollResult[] = [];
    (results.roll.results.dice)?.forEach((roll) => {
      console.log(`Die: ${roll}`)
      const critClass = (roll == 1) ? "critical-success" : 
                        (activeStats.focus.length > 0 && roll <= crit) ? "critical-success" : 
                        (roll == 20) ? "critical-failure" : "no-crit" ; 
      rollResult.push({
        roll: roll,
        class: critClass,
      });
    }); 
    //console.log(`Roll result array: ${JSON.stringify(rollResult)}`)
    
    // Create rolltemplate
    const bottomBarValues = [results.roll.expression.replace("<", " ≤ "), `Successes: ${results.roll.results.result}`]
    console.log(`Roll results: ${JSON.stringify(results)}`);
    const content = createRollTemplate({type: "roll", parameters: { 
      characterId: metaStore.id,
      ...activeStats,
      rollTitle: `${activeStats.attribute} + ${activeStats.department}` ,
      bottomBarValues,
      dice: results.roll.results.dice,
      critlevel: departmentLevel,
      rollResult: rollResult,
      characterName: metaStore.name,
    }})

    // Reduce the Determination and Increase Threat
    statsStore.conditionsFields.DETERMINATION.base = statsStore.DETERMINATION - activeStats.determinationDice;
    gmStore.resources.threat = gmStore.resources.threat + activeStats.threatDice; 
    
    // Post the rolltemplate to chat
    //console.log(`Roll content: ${JSON.stringify(content)}`);
    dispatch.post({
      content
    })
  }

  const handleSavedRollClick = (clickedRollName: string) => {
    const clickedRoll = savedRolls.get(clickedRollName);
    if (activeName.value === clickedRollName && savedRollActive.value) {
      doRoll();
      return;
    }
    activeName.value = clickedRollName;
    Object.assign(activeStats, {...clickedRoll});
  }

  const dehydrate = () => {
    const rolls: Record<string, ActiveStats> = {};
    for (const [name, roll] of savedRolls.entries()) {
      rolls[name] = roll
    }
    return { rolls };
  }

  type RollHydrate = {
    rolls: Record<string, ActiveStats>;
  }

  const hydrate = (hydrateStore: RollHydrate) => {
    savedRolls.clear()
    for (const entry of Object.entries(hydrateStore.rolls)){
      savedRolls.set(...entry)
    }
    activeStats.baseDice = 0;
    activeStats.determinationDice = 0;
    activeStats.threatDice = 0,
    activeStats.momentumDice = 0;
  }

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
  }
})