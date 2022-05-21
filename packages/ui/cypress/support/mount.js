import { mount as cyMount } from "@cypress/vue";
import { createVuetify } from "vuetify";
import { createTestingPinia } from "@pinia/testing";

function isObject(obj) {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
}

function mergeDeep(source = {}, target = {}, arrayFn = undefined) {
  const out = {};

  for (const key in source) {
    out[key] = source[key];
  }

  for (const key in target) {
    const sourceProperty = source[key];
    const targetProperty = target[key];

    // Only continue deep merging if
    // both properties are objects
    if (isObject(sourceProperty) && isObject(targetProperty)) {
      out[key] = mergeDeep(sourceProperty, targetProperty, arrayFn);

      continue;
    }

    if (
      Array.isArray(sourceProperty) &&
      Array.isArray(targetProperty) &&
      arrayFn
    ) {
      out[key] = arrayFn(sourceProperty, targetProperty);

      continue;
    }

    out[key] = targetProperty;
  }

  return out;
}

/**
 * @example
 * cy.mount(<VBtn>My button</VBtn>)
 */
Cypress.Commands.add("mount", (component, options, vuetifyOptions) => {
  const root = document.getElementById("__cy_root");

  // add the v-application class that allows Vuetify styles to work
  if (!root.classList.contains("v-locale--is-rtl")) {
    root.classList.add("v-locale--is-ltr");
  }

  const vuetify = createVuetify(vuetifyOptions);
  const defaultOptions = {
    global: {
      stubs: {
        transition: false,
        "transition-group": false,
      },
      plugins: [
        vuetify,
        createTestingPinia({
          createSpy(fn) {
            cy.stub().returns(fn ? fn() : undefined);
          },
        }),
      ],
    },
  };

  return cyMount(
    component,
    mergeDeep(defaultOptions, options, (a, b) => a.concat(b))
  ).as("wrapper");
});

Cypress.Commands.add("vue", () => {
  return cy.get("@wrapper");
});

/**
 * Update the props and wait for Vue to re-render.
 * Must be chained of a chain that starts with `cy.mount`.
 *
 * @example
 * cy.mount(<VBtn>My button</VBtn>)
 *   .get('button').
 *   .should('not.have.class', 'v-btn--disabled')
 *   .setProps({ disabled: true }).
 *   .get('button')
 *   .should('have.class', 'v-btn--disabled')
 */

Cypress.Commands.add("setProps", (props = {}) => {
  return cy.get("@wrapper").then(async (wrapper) => {
    // `wrapper` in inferred as JQuery<HTMLElement> since custom commands
    // generally receive a Cypress.Chainable as the first arg (the "subject").
    // the custom `mount` command defined above returns a
    // Test Utils' `VueWrapper`, so we need to cast this as `unknown` first.
    const vueWrapper = wrapper || Cypress.vueWrapper;
    await vueWrapper.setProps(props);
    return vueWrapper;
  });
});

Cypress.Commands.add("emitted", (selector, event) => {
  return cy.get("@wrapper").then((wrapper) => {
    const vueWrapper = wrapper || Cypress.vueWrapper;
    const cmp = vueWrapper.findComponent(selector);

    if (!cmp) return [];

    return cmp.emitted(event);
  });
});
