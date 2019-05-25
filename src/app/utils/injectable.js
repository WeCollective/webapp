/*  Abstract base class which all Angular Controller,
**  Service and Directive classes extend.
**  The extending class must explicitly call this constructor
**  in order to attach all injected dependencies to `this`.
**      names       array of name strings for the injected dependencies
**      injections  array of injected dependencies
*/
class Injectable {
  constructor(names, injections) {
    for (const idx in names) { // eslint-disable-line guard-for-in, no-restricted-syntax
      this[names[idx]] = injections[idx];
    }
  }
}

export default Injectable;
