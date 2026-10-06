import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// Mock the $t translation function (returns the key as-is)
Vue.prototype.$t = (key) => key;

Vue.config.productionTip = false;

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
