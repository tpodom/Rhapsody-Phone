import { h } from "vue";
import { createVuetify } from "vuetify";
import { VApp } from "vuetify/components";
import { mount, VueWrapper } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { createTestingPinia } from "@pinia/testing";

import CallList from "../CallList.vue";

describe("CallList", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const vuetify = createVuetify();

    // Certain Vuetify components (dialogs, menus, app bars, nav drawers)
    // must be mounted inside v-app.
    wrapper = mount(VApp, {
      props: {},
      slots: {
        default: h(CallList),
      },
      global: {
        plugins: [vuetify, createTestingPinia()],
      },
    });
  });
  it("Is a Vue instance", () => {
    expect(wrapper).toBeTruthy();
  });
});
