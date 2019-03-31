function validation() {
  const init = (() => {
    const validators = {
      required(key, val) {
        if ((Array.isArray(val) && val.length === 0) || !val) {
          return `${key} is required`;
        }
      }
    };
    return class Validation {
      constructor() {
        this.validates = new Map();
      }

      init(key, expression) {
        const validates = expression.replace(/'/g, "").split("|");
        this.validates.set(key, validates);
      }

      start(key, value) {
        const validates = this.validates.get(key);
        const errors = validates
          .map(fn => validators[fn](key, value))
          .filter(res => res);
        return errors;
      }

      all(context) {
        let errors = [];
        for (const key of this.validates.keys()) {
          errors = errors.concat(this.start(key, context[key]));
        }
        return errors;
      }
    };
  })();
  return init;
}

export default new (validation())();
