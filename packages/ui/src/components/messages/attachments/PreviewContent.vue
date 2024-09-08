<template>
  <v-img v-if="isImage" :src="url" @click.prevent="onClick" />

  <video-player
    v-else-if="isAudioVideo"
    class="vjs-big-play-centered"
    :src="{ src: url, type: attachment.type }"
    :height="height - headerSize * 2"
    :volume="0.6"
    controls
    @click.prevent="onClick"
  />

  <div
    v-else
    class="generic-file d-flex align-center justify-center flex-grow-1 h-100"
    :style="{ backgroundColor: fileType.color }"
    @click.prevent="onDownload"
  >
    <v-icon icon="mdi-paperclip" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";

interface Emits {
  (eventName: "click", attachment: File): void;
  (eventName: "download", attachment: File): void;
}

interface Props {
  attachment: File;
  ext: string;
  height: number;
  headerSize: number;
}

interface ExtensionType {
  icon: string;
  color: string;
}

const defaultFileType = {
  icon: "mdi-paperclip",
  color: "#b0abab",
};

const genericFileTypes: Record<string, ExtensionType> = {
  PDF: {
    icon: "mdi-paperclip",
    color: "#f40f02",
  },
  ZIP: {
    icon: "mdi-folder-zip-outline",
    color: "#b0abab",
  },
};

const props = defineProps<Props>();
const { attachment, ext, height, headerSize } = toRefs(props);

const url = computed(() => (attachment.value ? URL.createObjectURL(attachment.value) : undefined));

const isImage = computed(() => attachment.value?.type?.startsWith("image/"));

const isAudioVideo = computed(
  () => attachment.value?.type.startsWith("audio/") || attachment.value?.type.startsWith("video/"),
);

const fileType = computed(() => genericFileTypes[ext.value] ?? defaultFileType);

function onEnlarge() {}
</script>

<style lang="scss" scoped>
.generic-file {
  color: white;
}
</style>
