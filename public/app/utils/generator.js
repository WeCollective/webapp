class Generator {
  // run an es6 generator function through to completion
  static run (g, context, ...args) {
    const isPromise = obj => obj instanceof Promise;
    
    let iterator = g.apply(context, ...args), result;

    // asynchronously iterate over generator
    (function iterate (val, err) {
      result = err ? iterator.throw(err) : iterator.next(val);

      if (!result.done) {
        // yielded a native ES6 promise
        if (isPromise(result.value)) {
          // invoke iterate with the arguments of the promise result
          result.value
            .then(iterate)
            .catch(err => iterate(null, err));
        }
        // yielded an immediate value
        else {
          // wrap in setTimeout to avoid synchronous recursion
          // invoke iterate with the argument which is immediately available
          setTimeout(_ => iterate(result.value), 0);
        }
      }
    })();
  }
}

export default Generator;
