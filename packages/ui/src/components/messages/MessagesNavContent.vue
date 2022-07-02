<template>
  <v-text-field
    class="flex-grow-1"
    variant="outlined"
    hide-details
    placeholder="Search messages..."
    density="compact"
    clearable
  />
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.v-text-field {
  max-width: 500px;
  margin-left: 56px;
}
</style>
