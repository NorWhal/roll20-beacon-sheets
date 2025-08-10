import { createPinia } from "pinia";
import { useStarTrekStore } from "@/sheet/stores";

export class StoreClass {
  static store: any;
  constructor() {}

  static getInstance(storeHydrate: any): ReturnType<typeof useStarTrekStore> {
    if (!this.store) {
      createPinia();
      this.store = useStarTrekStore();
    }
    this.store.hydrateStore(storeHydrate ?? {});
    return this.store;
  }
}
