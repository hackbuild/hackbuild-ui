<script setup lang="ts">
import { useRoute } from 'vue-router'
import { registry } from '../registry'

const route = useRoute()

const emit = defineEmits<{
  navigate: []
}>()
</script>

<template>
  <div>
    <template v-for="group in registry" :key="group.category">
      <h4>{{ group.category }}</h4>
      <router-link
        v-for="entry in group.entries"
        :key="entry.name"
        :to="`/components/${entry.name}`"
        :class="{ 'is-here': route.params.name === entry.name }"
        @click="emit('navigate')"
      >
        {{ entry.name }}
      </router-link>
    </template>
  </div>
</template>
