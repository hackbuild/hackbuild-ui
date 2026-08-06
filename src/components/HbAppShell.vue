<script setup lang="ts">
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <!-- Full height tool layout. Header, tabs and status strip pinned, one
       scrolling work column beside one scrolling rail. Below 900 px the
       shell unpins and the rail stacks under the work column. -->
  <div class="hb-app hb">
    <slot name="header" />
    <slot name="tabs" />
    <slot name="toolbar" />
    <div class="hb-work">
      <div class="hb-main">
        <slot />
      </div>
      <aside v-if="slots.rail" class="hb-rail">
        <slot name="rail" />
      </aside>
    </div>
    <slot name="statusbar" />
  </div>
</template>
