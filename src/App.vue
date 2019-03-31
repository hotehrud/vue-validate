<template>
  <div id="app">
    <v-icon v-if="!inputData" name="spinner" scale="2" spin/>
    <form-estimate v-else :inputData="inputData"/>
  </div>
</template>

<script>
import inputs from "@/assets/input";
import FormEstimate from "@/components/FormEstimate.vue";
import { delay } from "@/js/helper";

export default {
  components: {
    FormEstimate
  },
  data() {
    return {
      inputData: null
    };
  },
  async created() {
    await delay();
    this.inputData = inputs;
  }
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

html {
  box-sizing: border-box;
  background-color: #f6f6f6;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

#app {
  position: absolute;
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #3d454d;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

ul {
  list-style-type: none;
}
</style>
