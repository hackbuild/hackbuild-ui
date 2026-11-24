<script setup lang="ts">
import HbFold from './HbFold.vue'
import HbCodeBlock from './HbCodeBlock.vue'

export interface HbHowLinks {
  /** The package page. */
  page?: string
  /** The source. */
  source?: string
}

interface Props {
  /** Package names, '@hackbuild/chat'. */
  packages: string[]
  /** The install line once the packages are on npm. */
  install: string
  /** The line that works today, a tarball in the repo. Shown second. */
  today?: string
  /** The packages are on npm: the first line works, the second is dropped. */
  published?: boolean
  /** The minimal code that does what the page just did. */
  code: string
  lang?: string
  links?: HbHowLinks
  summary?: string
  num?: number
  persistKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  today: undefined,
  published: false,
  lang: 'ts',
  links: () => ({}),
  summary: 'how this works',
  num: undefined,
  persistKey: undefined,
})

const open = defineModel<boolean>({ default: false })
</script>

<template>
  <!-- The fold at the foot of every tool: which packages, how to install
       them, the least code that does this, and where to read more. -->
  <HbFold v-model="open" class="hb-how" :summary="props.summary" :num="props.num" :persist-key="props.persistKey">
    <div class="hb-how-pkgs">
      <span class="hb-how-k">packages</span>
      <code v-for="p in props.packages" :key="p" class="hb-code">{{ p }}</code>
    </div>
    <div class="hb-how-install">
      <span class="hb-how-k">install</span>
      <HbCodeBlock :code="props.install" lang="sh" :wrap-toggle="false" wrap label="install line" />
      <p v-if="!props.published" class="hb-how-note">
        {{ props.today ? 'not on npm yet. the line below works today.' : 'not on npm yet.' }}
      </p>
      <HbCodeBlock v-if="!props.published && props.today" :code="props.today" lang="sh" :wrap-toggle="false" wrap label="install line that works today" />
    </div>
    <div class="hb-how-code">
      <span class="hb-how-k">code</span>
      <HbCodeBlock :code="props.code" :lang="props.lang" label="minimal code" />
    </div>
    <div v-if="props.links.page || props.links.source" class="hb-how-links">
      <a v-if="props.links.page" class="hb-link" :href="props.links.page">package page</a>
      <a v-if="props.links.source" class="hb-link" :href="props.links.source">source</a>
    </div>
  </HbFold>
</template>
