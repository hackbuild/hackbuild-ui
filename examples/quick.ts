// The smallest page: the faces, the stylesheet and three parts.
import { createApp, h } from 'vue'
import '@virgilvox/hackbuild-ui/fonts-local.css'
import '@virgilvox/hackbuild-ui/styles.css'
import { HbButton, HbKv, HbPanel } from '@virgilvox/hackbuild-ui'

const App = {
  setup() {
    return () =>
      h(HbPanel, { heading: 'tuning' }, () => [
        h(HbKv, { label: 'center', value: '433.920' }),
        h(HbButton, { variant: 'go', onClick: () => console.log('connect') }, () => 'connect'),
      ])
  },
}

document.body.classList.add('hb')
createApp(App).mount('#app')
