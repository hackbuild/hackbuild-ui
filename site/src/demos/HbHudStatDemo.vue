<script setup lang="ts">
import { HbHudStat, HbStage } from '@hackbuild/ui'
import DemoSection from '../components/DemoSection.vue'
import PropsTable from '../components/PropsTable.vue'

const code = `<HbHudStat label="fps" :value="58.7" />
<HbHudStat label="frame" :value="21.4" unit="ms" state="warn" />`
</script>

<template>
  <DemoSection title="Hud stat" note="A small lit figure for the corner of a stage: fps, frame time, inference time. warn when a frame budget is missed, err when the loop stalls." :code="code">
    <HbStage label="hud">
      <div class="demo-row">
        <HbHudStat label="fps" :value="58.7" />
        <HbHudStat label="frame" :value="21.4" unit="ms" state="warn" />
        <HbHudStat label="infer" :value="Number.NaN" unit="ms" state="err" />
      </div>
    </HbStage>
  </DemoSection>
  <PropsTable
    :rows="[
      { prop: 'label', type: 'string' },
      { prop: 'value', type: 'string | number', notes: 'a non finite number shows --' },
      { prop: 'unit', type: 'string' },
      { prop: 'state', type: `'none' | 'warn' | 'err'`, default: 'none' },
      { prop: 'digits', type: 'number', default: '1' },
    ]"
  />
</template>
