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
import { Gender, Pet, SpayedNeuteredStatus } from "../stores/clients";
import { computed } from "vue";

interface Props {
  pet: Pet;
  rhapsodyClientId: string;
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
const rhapsodyLink = computed(
  () => `https://portal.rhapsody.vet/client/${props.rhapsodyClientId}/patient/${props.pet.id}`,
);
</script>

<style lang="scss" scoped>
.deceased {
  font-style: italic;
}

a {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}
</style>
