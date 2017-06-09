import Injectable from 'utils/injectable';

class LocalStorageService extends Injectable {
  constructor (...injections) {
    super(LocalStorageService.$inject, injections);
  }

  get (key, defaultValue) {
    return window.localStorage[key] || defaultValue;
  }

  getObject (key) {
    return JSON.parse(this.get(key) || '{}');
  }

  set (key, newValue) {
    window.localStorage[key] = newValue;
  }

  setObject (key, newValue = {}) {
    this.set(key, JSON.stringify(newValue));
  }
}

export default LocalStorageService;
