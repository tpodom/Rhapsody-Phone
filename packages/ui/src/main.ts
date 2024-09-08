import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { pinia } from "./plugins/pinia";
import router from "./router";
import VueVideoPlayer from "@videojs-player/vue";
import "video.js/dist/video-js.css";

loadFonts();

createApp(App).use(vuetify).use(pinia).use(router).use(VueVideoPlayer).mount("#app");
