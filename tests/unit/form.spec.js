import { expect } from "chai";
import { shallowMount } from "@vue/test-utils";
import FormEstimate from "@/components/FormEstimate.vue";

import inputData from "@/assets/input";

describe("FormEstimate.vue", () => {
  const mountComponent = () => {
    return shallowMount(FormEstimate, {
      propsData: { inputData }
    });
  };

  it("itemId in the input is stored to data-attribute", () => {
    const wrapper = mountComponent();
    const vm = wrapper.vm;
    expect(
      Number(wrapper.find(".box-container").attributes("data-item-id"))
    ).to.equal(vm.step);
  });

  it("It'll validate when a button is clicked", () => {
    const wrapper = mountComponent();

    // incorrect
    wrapper.find(".next").trigger("click");
    expect(wrapper.vm.errors).to.have.property("length", 1);

    // correct
    wrapper.find("#checkbox-1").trigger("click");
    wrapper.find(".next").trigger("click");
    expect(wrapper.vm.errors).to.be.empty;
  });

  it("It'll validate when a dot is clicked", () => {
    const wrapper = mountComponent();
    const vm = wrapper.vm;
    const start = vm.step;
    const jump = 4;
    // incorrect
    wrapper
      .findAll(".dots > li")
      .at(jump - 1)
      .trigger("click");
    expect(vm.step).to.equal(start);

    // correct
    wrapper.find("#checkbox-1").trigger("click");
    wrapper
      .findAll(".dots > li")
      .at(jump - 1)
      .trigger("click");
    expect(vm.step).to.equal(jump);
  });

  it("all forms have to fill out to submit", () => {
    const wrapper = mountComponent();
    const vm = wrapper.vm;
    // incorrect
    expect(wrapper.vm.canSubmit).to.be.false;

    // correct
    vm.completed.forEach((v, i) => {
      vm.completed[i] = true;
    });
    vm.step++;
    expect(wrapper.vm.canSubmit).to.be.true;
  });
});
