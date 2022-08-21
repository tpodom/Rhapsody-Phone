<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn icon="mdi-calendar" v-bind="props" />
    </template>

    <v-list> </v-list>
  </v-menu>
</template>

<script lang="ts" setup>
interface Props {
  clientId: string;
}

const props = defineProps<Props>();
</script>
