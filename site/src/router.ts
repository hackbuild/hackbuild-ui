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
    { path: '/icons', component: () => import('./pages/IconsPage.vue') },
    { path: '/look', component: () => import('./pages/LookPage.vue') },
    { path: '/demos', component: () => import('./pages/DemosPage.vue') },
    { path: '/demos/bench', component: () => import('./pages/DemoBench.vue'), meta: { bare: true } },
    { path: '/demos/zine', component: () => import('./pages/DemoZine.vue'), meta: { bare: true } },
    { path: '/demos/settings', component: () => import('./pages/DemoSettings.vue'), meta: { bare: true } },
    { path: '/demos/shell-rack', component: () => import('./pages/DemoShellRack.vue'), meta: { bare: true } },
    { path: '/demos/shell-bench', component: () => import('./pages/DemoShellBench.vue'), meta: { bare: true } },
    { path: '/demos/shell-transcript', component: () => import('./pages/DemoShellTranscript.vue'), meta: { bare: true } },
    { path: '/demos/phone-rack', component: () => import('./pages/DemoPhoneRack.vue'), meta: { bare: true } },
    { path: '/demos/stage-chat', component: () => import('./pages/DemoStageChat.vue'), meta: { bare: true } },
    { path: '/demos/stage-tool', component: () => import('./pages/DemoStageTool.vue'), meta: { bare: true } },
    { path: '/demos/suite-shell', component: () => import('./pages/DemoSuiteShell.vue'), meta: { bare: true } },
    { path: '/demos/suite-chat', component: () => import('./pages/DemoSuiteShell.vue'), meta: { bare: true } },
    { path: '/layouts/stage-rack', component: () => import('./pages/layouts/StageRackDemo.vue'), meta: { bare: true } },
    { path: '/layouts/canvas-rail', component: () => import('./pages/layouts/CanvasRailDemo.vue'), meta: { bare: true } },
    { path: '/layouts/drop-first', component: () => import('./pages/layouts/DropFirstDemo.vue'), meta: { bare: true } },
    { path: '/layouts/conversation', component: () => import('./pages/layouts/ConversationDemo.vue'), meta: { bare: true } },
    { path: '/layouts/gate', component: () => import('./pages/layouts/GateDemo.vue'), meta: { bare: true } },
    { path: '/layouts/form-frame', component: () => import('./pages/layouts/FormFrameDemo.vue'), meta: { bare: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash }
    return { top: 0 }
  },
})
