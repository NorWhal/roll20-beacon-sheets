import { createMemoryHistory, createRouter } from "vue-router";
import PCView from "@/views/PCView.vue";
import GMView from "../views/GMView.vue";

const router = createRouter({
  history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/gm",
      name: "gm",
      component: GMView,
    },
    {
      path: "/pc",
      name: "pc",
      component: PCView,
    },
  ],
});
export default router;
