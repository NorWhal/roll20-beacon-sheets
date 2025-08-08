import { createRouter, createWebHistory } from 'vue-router'
import PCView from '@/views/PCView.vue'
import GMView from '../views/GMView.vue'

/*
 * Vue Router is used for switching between the 2 different views in the sheet.
 * It's a good solution for when using tabs, character builder, settings page, etc.
 * */
const router = createRouter({
  // @ts-expect-error says .env doesn't exist when it does
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/gm',
      name: 'gm',
      component: GMView,
    },
    {
      path: '/pc',
      name: 'pc',
      component: PCView,
    },
  ],
})
export default router
