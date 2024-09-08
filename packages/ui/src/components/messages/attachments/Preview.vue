<template>
  <v-tooltip>
    <template #activator="{ props }">
      <div class="d-flex flex-column mx-2 mb-2">
        <v-sheet class="wrapper" elevation="1" :width="width" :height="width" v-bind="props">
          <div class="header d-flex ml-2 align-center">
            <div class="name text-truncate">{{ attachment.name }}</div>
            <v-spacer />
            <v-icon v-if="deletable" icon="mdi-close" class="close" @click="onRemove" small />
          </div>

          <div class="content h-100 d-flex align-center justify-center">
            <PreviewContent :attachment="attachment" :ext="ext" :height="width" :header-size="24" />
          </div>

          <div class="footer d-flex ml-2 align-center">
            <div class="extension text-truncate">{{ ext }}</div>
            <v-spacer />
            {{ fileSize }}
          </div>
        </v-sheet>
      </div>
    </template>
    {{ attachment.name }}
  </v-tooltip>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";
import { formatFileSize } from "../../../lib/formatters";
import PreviewContent from "./PreviewContent.vue";

interface Emits {
  (eventName: "remove", attachment: File): void;
}

interface Props {
  attachment: File;
  deletable?: boolean;
  width: number;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();
const { attachment, deletable, width } = toRefs(props);

const ext = computed(() => {
  const index = attachment.value.name.lastIndexOf(".");
  return index > 0 ? attachment.value.name.slice(index + 1).toLocaleUpperCase() : "";
});

const fileSize = computed(() => formatFileSize(attachment.value.size));

function onRemove() {
  emit("remove", attachment.value);
}
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  background-color: black;
}

.content::before {
  content: " ";
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.25) 100%);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 24px;
  z-index: 2;
}

.content::after {
  content: " ";
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.65) 100%);
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 24px;
  z-index: 2;
}

.header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 3;
  color: white;
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  color: white;
}

.name {
  font-size: 16px;
  line-height: 28px;
}
</style>
