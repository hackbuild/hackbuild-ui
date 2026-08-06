import { createApp } from 'vue'
import '@hackbuild/ui/styles.css'
import './site.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
