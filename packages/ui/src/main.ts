import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import { pinia } from "./plugins/pinia";
import router from "./router";
import InstantSearch from "vue-instantsearch/vue3/es";

loadFonts();

createApp(App).use(vuetify).use(pinia).use(router).use(InstantSearch).mount("#app");
