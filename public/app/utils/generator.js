class Generator {
  static run(g) {
    const isPromise = (obj) => obj instanceof Promise;
    var iterator = g(), result;

    // asynchronously iterate over generator
    (function iterate(val) {
      result = iterator.next(val);

      if (!result.done) {
        // yielded a native ES6 promise
        if (isPromise(result.value)) {
          // invoke iterate with the arguments of the promise result
          result.value.then(iterate);
        }
        // yielded an immediate value
        else {
          // wrap in setTimeout to avoid synchronous recursion
          setTimeout( function(){
            // invoke iterate with the argument which is immediately available
            iterate(result.value);
          }, 0);
        }
      }
    })();
  }
}

export default Generator;
