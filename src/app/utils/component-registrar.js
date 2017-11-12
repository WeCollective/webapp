import angular from 'angular'; // eslint-disable-line

class ComponentRegistrar {
  constructor(app) {
    this.app = app;
  }

  config(constructorFn) {
    constructorFn = this._normalizeConstructor(constructorFn);
    const factoryArray = this._createFactoryArray(constructorFn);
    this.app.config(factoryArray);
    return this;
  }

  controller(name, constructorFn) {
    constructorFn = this._normalizeConstructor(constructorFn);
    const factoryArray = this._createFactoryArray(constructorFn);
    this.register(name, factoryArray, 'controller');
    return this;
  }

  directive(name, constructorFn) {
    constructorFn = this._normalizeConstructor(constructorFn);
    if (!constructorFn.prototype.compile) {
      // create an empty compile function if none was defined.
      constructorFn.prototype.compile = () => {};
    }

    const originalCompileFn = this._cloneFunction(constructorFn.prototype.compile);

    // Decorate the compile method to automatically return the link method (if it exists)
    // and bind it to the context of the constructor (so `this` works correctly).
    // This gets around the problem of a non-lexical "this" which occurs when the directive class
    // itself returns `this.link` from within the compile function.
    this._override(constructorFn.prototype, 'compile', function () {
      return function () {
        originalCompileFn.apply(this, arguments);
        if (constructorFn.prototype.link) {
          return constructorFn.prototype.link.bind(this);
        }
      };
    });

    const factoryArray = this._createFactoryArray(constructorFn);

    this.register(name, factoryArray, 'directive');
    return this;
  }

  factory(name, constructorFn) {
    constructorFn = this._normalizeConstructor(constructorFn);
    const factoryArray = this._createFactoryArray(constructorFn);
    this.register(name, factoryArray, 'factory');
    return this;
  }

  provider(name, constructorFn) {
    this.register(name, constructorFn, 'provider');
    return this;
  }

  register(name, constructorFn, type) {
    if (name && constructorFn) {
      this.app[type](name, constructorFn);
    }
    else {
      console.warn(`Couldn't register ${type} ${name}: undefined constructor function.`);
    }
  }

  run(constructorFn) {
    constructorFn = this._normalizeConstructor(constructorFn);
    const factoryArray = this._createFactoryArray(constructorFn);
    console.log(factoryArray);
    this.app.run(factoryArray);
  }

  service(name, constructorFn) {
    this.register(name, constructorFn, 'service');
    return this;
  }

  /*
   * Clone a function
   */
  _cloneFunction(original) {
    return function () {
      return original.apply(this, arguments);
    };
  }

  /*
   * Convert a constructor function into a factory function which returns a new instance of that
   * constructor, with the correct dependencies automatically injected as arguments.
   *
   * In order to inject the dependencies, they must be attached to the constructor function with the
   * `$inject` property annotation.
   */
  _createFactoryArray(ConstructorFn) {
    // get the array of dependencies that are needed by this
    // component (as contained in the `$inject` array)
    const args = ConstructorFn.$inject || [];
    const factoryArray = args.slice(); // create a copy of the array

    // The factoryArray uses Angular's array notation whereby each element of the array is
    // the name of a dependency, and the final item is the factory function itself.
    factoryArray.push((...params) => {
      // return new ConstructorFn(...args);
      const instance = new ConstructorFn(...params);

      for (let key in instance) {
        instance[key] = instance[key];
      }

      return instance;
    });

    return factoryArray;
  }

  /*
   * If the constructorFn is an array of type ['dep1', 'dep2', ..., constructor() {}]
   * we need to pull out the array of dependencies and add it as an $inject property of the
   * actual constructor function.
   */
  _normalizeConstructor(input) {
    let constructorFn;

    if (input.constructor === Array) {
      const injected = input.slice(0, input.length - 1);
      constructorFn = input[input.length - 1];
      constructorFn.$inject = injected;
    }
    else {
      constructorFn = input;
    }

    return constructorFn;
  }

  /**
   * Override an object's method with a new one specified by `callback`.
   */
  _override(object, methodName, callback) {
    object[methodName] = callback(object[methodName]);
  }
}

export default ComponentRegistrar;
