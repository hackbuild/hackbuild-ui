import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/components', redirect: '/components/HbButton' },
    {
      path: '/components/:name',
      component: () => import('./pages/ComponentPage.vue'),
    },
    { path: '/tokens', component: () => import('./pages/TokensPage.vue') },
    { path: '/brand', component: () => import('./pages/BrandPage.vue') },
    { path: '/demos', component: () => import('./pages/DemosPage.vue') },
    { path: '/demos/bench', component: () => import('./pages/DemoBench.vue'), meta: { bare: true } },
    { path: '/demos/zine', component: () => import('./pages/DemoZine.vue'), meta: { bare: true } },
    { path: '/demos/settings', component: () => import('./pages/DemoSettings.vue'), meta: { bare: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
