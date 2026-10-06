import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// Minimal Vuex store for mock projects.
// Extend this per-project when components need more state.
// Example: add getters, mutations, or full modules as needed.
export const store = new Vuex.Store({
  state: {},
  getters: {
    isModelLoadingScreenShowing: () => false,
  },
});
