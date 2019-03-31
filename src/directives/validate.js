import validator from "@/js/validator";

export default {
  bind(el, binding) {
    // name-property of input, value of v-validate
    validator.init(el.name, binding.expression);
  },
  update(el, binding, vnode) {
    // name-property of input, reactive-date in vue
    validator.start(el.name, vnode.context[el.name]);
  }
};
