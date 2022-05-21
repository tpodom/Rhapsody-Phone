import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { pinia } from "./plugins/pinia";
import router from "./router";

loadFonts();

createApp(App).use(vuetify).use(pinia).use(router).mount("#app");
