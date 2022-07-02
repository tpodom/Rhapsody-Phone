import { createVuetify } from "vuetify";
import { mount, VueWrapper } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { createTestingPinia } from "@pinia/testing";

import CallList from "./CallList.vue";

describe("CallList", () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    const vuetify = createVuetify();

    wrapper = mount(CallList, {
      props: {},
      global: {
        plugins: [vuetify, createTestingPinia()],
      },
    });
  });
  it("Is a Vue instance", () => {
    expect(wrapper).toBeTruthy();
  });
});
