<template>
  <div class="pet-name" :class="{ deceased: pet.deceased }">
    <v-icon :icon="genderIcons[pet.gender]" :color="genderColors[pet.gender]" />
    <a :href="rhapsodyLink" target="_blank">{{ pet.name }}</a>
    <span v-if="pet.spayedNeuteredStatus === SpayedNeuteredStatus.NEUTERED"> (N) </span>
    <span v-if="pet.spayedNeuteredStatus === SpayedNeuteredStatus.SPAYED"> (S) </span>
  </div>
</template>

<script setup lang="ts">
import { VIcon } from "vuetify/components";
import { Gender, SpayedNeuteredStatus } from "../types/clients";
import type { Pet } from "../types/clients";
import { computed } from "vue";
import { getPatientLink } from "../lib/rhapsody";

interface Props {
  pet: Pet;
  clientId: string;
}

const genderIcons = {
  [Gender.FEMALE]: "mdi-gender-female",
  [Gender.MALE]: "mdi-gender-male",
};

const genderColors = {
  [Gender.FEMALE]: "red",
  [Gender.MALE]: "blue",
};

const props = defineProps<Props>();
const rhapsodyLink = computed(() => getPatientLink(props.clientId, props.pet.id));
</script>

<style lang="scss" scoped>
.deceased {
  font-style: italic;
}

a {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}
</style>
