<template>
  <div id="form-container">
    <transition name="fade" mode="out-in">
      <form @submit.prevent="onSubmit" :class="{'has-error': hasError}">
        <h2>{{form.title}}</h2>
        <transition name="fade" mode="out-in">
          <div
            v-if="step === 1"
            key="1"
            data-validator-key="selectorRequirement"
            :data-item-id="requirement.itemId"
            class="box-container"
          >
            <h4>{{requirement.title}}</h4>
            <ul class="form-list">
              <li v-for="(item, index) in requirement.options" :key="index" class="control">
                <input
                  type="checkbox"
                  name="selectorRequirement"
                  :id="'checkbox-' + index"
                  :value="item.text"
                  v-model="selectorRequirement"
                  v-validate="'required'"
                >
                <label :for="'checkbox-' + index">{{item.text}}</label>
                <div class="check check-checkbox"></div>
              </li>
            </ul>
          </div>
          <div
            v-if="step === 2"
            key="2"
            data-validator-key="selectorDuration"
            :data-item-id="duration.itemId"
            class="box-container"
          >
            <h4>{{duration.title}}</h4>
            <ul class="form-list">
              <li v-for="(item, index) in duration.options" :key="index" class="control">
                <input
                  type="radio"
                  name="selectorDuration"
                  :id="'radio-' + index"
                  :value="item.text"
                  v-model="selectorDuration"
                  v-validate="'required'"
                >
                <label :for="'radio-' + index">{{item.text}}</label>
                <div class="check check-radio"></div>
              </li>
            </ul>
          </div>
          <div
            v-if="step === 3"
            key="3"
            data-validator-key="selectorAddition"
            :data-item-id="addition.itemId"
            class="box-container text-box"
          >
            <h4>{{addition.title}}</h4>
            <div class="text-box-container">
              <input
                type="text"
                name="selectorAddition"
                id="addition"
                v-model="selectorAddition"
                v-validate="'required'"
              >
              <label for="addition">자유롭게 작성하시면 됩니다.</label>
            </div>
          </div>
          <div
            v-if="step === 4"
            key="4"
            data-validator-key="selectorQuestion"
            :data-item-id="question.itemId"
            class="box-container select-box"
          >
            <h4>{{question.title}}</h4>
            <select
              name="selectorQuestion"
              id="selector"
              v-model="selectorQuestion"
              v-validate="'required'"
              class="select"
            >
              <option disabled value>Please select one</option>
              <option v-for="(item, index) in question.options" :key="index">{{item.text}}</option>
            </select>
            <label for="selector">
              <span>{{selectorQuestion}}</span>
            </label>
          </div>
        </transition>

        <span v-if="step !== 1" class="prev" @click="move(-1)"/>
        <span v-if="step !== end" class="next" @click="move(1)"/>

        <p v-if="hasError" class="error-text">{{errorMessage}}</p>

        <ul class="dots">
          <li
            v-for="(dot, index) in form.items"
            :key="index"
            :class="{ active: ++index === step, completed: completed[index]}"
            @click="jump(index)"
          ></li>
        </ul>

        <button v-if="canSubmit && step === end" type="submit">Submit</button>
      </form>
    </transition>
  </div>
</template>

<script>
import validate from "@/directives/validate";
import validator from "@/js/validator";

export default {
  directives: {
    validate
  },
  props: {
    inputData: Object
  },
  data() {
    return {
      form: null,
      requirement: null,
      duration: null,
      addition: null,
      question: null,
      selectorRequirement: [],
      selectorDuration: "",
      selectorAddition: "",
      selectorQuestion: "",
      step: 1,
      end: 0,
      errors: {},
      completed: false,
      canSubmit: false,
      hasError: false
    };
  },
  async created() {
    this.form = this.inputData;
    const items = this.form.items;
    this.requirement = items[0];
    this.duration = items[1];
    this.addition = items[2];
    this.question = items[3];
    this.end = items.length;

    const completed = Array.from(Array(this.end + 1), () => false);
    this.completed = [...completed];
    this.outputs = {};
  },
  updated() {
    // for outputs
    const container = this.$el.querySelector(".box-container");
    const dataset = container.dataset;
    const key = dataset.validatorKey;
    const itemId = dataset.itemId;

    if (!this.outputs[key]) {
      this.outputs[key] = {
        id: itemId
      };
    }
  },
  computed: {
    errorMessage() {
      return this.errors.toString();
    }
  },
  methods: {
    move(amount) {
      if (!this.isValid()) {
        return;
      }

      const newIndex = this.step + amount;
      let nextStep = newIndex;

      if (newIndex > this.end) {
        nextStep = 1;
      }
      if (newIndex === 0) {
        nextStep = this.end;
      }

      this.step = nextStep;
    },
    jump(nextStep) {
      if (!this.isValid()) {
        return;
      }
      this.step = nextStep;
    },
    isValid() {
      const container = this.$el.querySelector(".box-container");
      const dataset = container.dataset;
      const key = dataset.validatorKey;

      this.errors = [...validator.start(key, this[key])];
      if (this.errors.length === 0) {
        return true;
      }
      this.hasError = true;
      return false;
    },
    onSubmit() {
      this.errors = [...validator.all(this)];
      if (this.errors.length === 0) {
        // success
        const result = {
          formId: this.form.formId,
          items: []
        };
        for (const key in this.outputs) {
          const id = this.outputs[key].id;
          const answer = Array.isArray(this[key])
            ? this[key].join(",")
            : this[key];

          result.items.push({
            id: id,
            answer: answer
          });
        }
        this.hasError = false;
        console.log(result)
        return true;
      }

      this.hasError = true;
    }
  },
  watch: {
    step(newVal, oldVal) {
      if (!this.completed[oldVal]) {
        this.completed[oldVal] = true;
      }

      this.hasError = false;

      // check completed
      let end;
      if (newVal === this.end) {
        end = this.end - 1;
      } else {
        end = this.end;
      }
      this.canSubmit = this.completed.slice(1, end + 1).every(v => v);
    }
  }
};
</script>

<style scoped lang="scss">
$completed-color: #1976d2;

#form-container {
  position: relative;
  width: 500px;
  text-align: center;
  background: #fff;
  padding: 30px 50px;
  -webkit-box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2),
    0 5px 5px 0 rgba(0, 0, 0, 0.24);
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);

  form {
    margin: 0 10px 20px 10px;
  }

  form.has-error {
    label {
      border: 2px solid #e74c3c;
    }
  }

  .form-list {
    li.control {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 100px;
      border-bottom: 1px solid #333;
      color: #aaaaaa;
      input[type="radio"],
      input[type="checkbox"] {
        position: absolute;
        visibility: hidden;
      }
      label {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 30px;
        font-weight: 300;
        font-size: 1.35em;
        padding: 25px 25px 25px 80px;
        margin: 10px auto;
        z-index: 9;
        cursor: pointer;
        transition: all 0.25s linear;
      }
      &:hover label {
        color: #000;
      }
      .check {
        position: absolute;
        height: 30px;
        width: 30px;
        left: 20px;
        transition: border 0.25s linear;
        &:before {
          content: "";
          position: absolute;
          display: block;
        }
      }
      .check-radio {
        border: 5px solid #aaaaaa;
        border-radius: 100%;
        &:before {
          top: 5px;
          left: 5px;
          width: 10px;
          height: 10px;
          border-radius: 100%;
          margin: auto;
          transition: background 0.25s linear;
        }
      }

      .check-checkbox {
        border: 5px solid transparent;
        background: #aaa;
        &:before {
          opacity: 0;
          left: 6px;
          top: 1px;
          width: 8px;
          height: 15px;
          border: solid #fff;
          border-width: 0 3px 3px 0;
          transform: rotate(45deg);
        }
      }

      &:hover .check-radio {
        border: 5px solid #000;
      }

      input:checked ~ .check {
        border: 5px solid $completed-color;
      }

      input:checked ~ .check::before {
        background: $completed-color;
      }

      input:checked ~ label {
        color: $completed-color;
      }

      input:checked ~ .check-checkbox {
        background: $completed-color;
        &:before {
          opacity: 1;
        }
      }
    }
  }

  .text-box {
    .text-box-container {
      position: relative;
      background: #eee;
      overflow: hidden;
      label {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        font-size: 1.2rem;
        font-weight: normal;
        margin: 0;
        padding: 18px 12px 0;
        transition: all 0.4s;
        width: 100%;
      }
      input[type="text"] {
        appearance: none;
        background: transparent;
        border: 0;
        border-bottom: 1px solid #999;
        color: #333;
        display: block;
        font-size: 1.2rem;
        margin-top: 30px;
        outline: 0;
        padding: 0 12px 10px 12px;
        width: 100%;
        &:focus ~ label {
          color: $completed-color;
          font-size: 0.75rem;
          transform: translateY(-14px);
        }
      }
    }
  }

  .select-box {
    position: relative;
    width: 100%;
    padding: 0px 30px;
    margin: 10px 0px 20px 0px;
    select,
    label {
      display: block;
      height: 40px;
    }
    select {
      position: absolute;
      width: calc(100% - 60px);
      padding: 5px 0;
      opacity: 0;
      background: none transparent;
      border: 0 none;
      z-index: 9;
    }

    label {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px 10px;
      background: #eee;
      cursor: pointer;
      span {
        margin-left: -30px;
      }
    }

    label::after {
      content: "▼";
      font-size: 12px;
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      padding: 12px 15px;
      border-left: 5px solid #fff;
    }
  }

  .dots {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    bottom: 20px;

    li {
      width: 6px;
      height: 6px;
      border-radius: 3px;
      background: $primary;
      opacity: 0.2;
      display: inline-block;
      margin: 0 3px;
      cursor: pointer;
      transition: opacity 0.4s ease-in-out,
        width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

      &.active {
        width: 22px;
        opacity: 1;
      }
      &.completed {
        opacity: 1 !important;
        background: #1976d2;
      }
    }
  }

  .prev,
  .next {
    position: absolute;
    top: 50%;
    left: 5px;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid $primary;
    color: $primary;
    border-radius: 50%;
    margin-top: -25px;
    cursor: pointer;
    line-height: 50px;
    text-align: center;
    text-indent: -2px;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    &:before {
      content: "";
      display: block;
      width: 10px;
      height: 10px;
      border: solid #000;
      border-width: 0 3px 3px 0;
      transform: rotate(-45deg);
    }
    &:hover {
      background: $primary;
      transform: scale(1.2);
      &:before {
        border: solid #fff;
        border-width: 0 3px 3px 0;
      }
    }

    &:active {
      transform: translate(0, 3px) scale(1.2);
    }
  }

  .error-text {
    color: red;
  }

  .prev {
    &:before {
      margin-left: 3px;
      transform: rotate(135deg);
    }
  }
  .next {
    right: 5px;
    margin-left: auto;
    text-indent: 2px;
    &:before {
      margin-right: 3px;
      transform: rotate(-45deg);
    }
  }

  button[type="submit"] {
    border-radius: 5px;
    margin: 5px;
    color: #000;
    padding: 15px 30px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    cursor: pointer;
    &:hover {
      color: #fff;
      background-color: $primary;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
    opacity: 0;
  }
}
</style>
