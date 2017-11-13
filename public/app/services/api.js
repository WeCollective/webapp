import Injectable from 'utils/injectable';

class API extends Injectable {
  constructor(...injections) {
    super(API.$inject, injections);
  }

  delete(url, params, data, urlFormEncode) {
    return this.request('DELETE', url, params, data, urlFormEncode);
  }

  get(url, params, data, urlFormEncode) {
    return this.request('GET', url, params, data, urlFormEncode);
  }

  // Params: data, headersGetter
  makeFormEncoded(data) {
    const str = [];
    for (const d in data) { // eslint-disable-line guard-for-in, no-restricted-syntax
      str.push(`${encodeURIComponent(d)}=${encodeURIComponent(data[d])}`);
    }
    return str.join('&');
  }

  normaliseResponse(data, headersGetter, status) {
    try {
      data = JSON.parse(data);
      data.status = status;
      return data;
    }
    catch (e) {
      return data;
    }
  }

  post(url, params, data, urlFormEncode) {
    return this.request('POST', url, params, data, urlFormEncode);
  }

  put(url, params, data, urlFormEncode) {
    return this.request('PUT', url, params, data, urlFormEncode);
  }

  request(method, url, params, data, urlFormEncode) {
    return new Promise((resolve, reject) => {
      // ensure url has a leading slash
      if (url[0] !== '/') {
        url = `/${url}`;
      }

      // replace :params in the url with their specified values
      for (const paramName of Object.keys(params)) { // eslint-disable-line no-restricted-syntax
        url = url.replace(new RegExp(`:${paramName}`, 'g'), params[paramName]);
      }

      url = this.ENV.apiEndpoint + url;

      // make the request
      const req = {
        method,
        transformResponse: this.normaliseResponse,
        url,
      };

      if (!!urlFormEncode) {
        req.headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        req.transformRequest = this.makeFormEncoded;
      }
      else {
        req.headers = {
          'Content-Type': 'application/json',
        };
      }

      const jwt = this.Auth.get();
      if (jwt) {
        req.headers.Authorization = `Bearer ${jwt}`;
      }

      if (method === 'PUT' || method === 'POST') {
        req.data = data;
      }

      if (method === 'GET' || method === 'DELETE') {
        req.params = data;
      }

      this.$http(req)
        .then(res => resolve(res.data || res))
        .catch(err => {
          if (err && typeof err === 'object' && err.data) {
            // The user is banned, remove any locally stored tokens.
            if (err.data.status === 401) {
              this.LocalStorageService.setObject('cache', {});
              this.Auth.set();
            }
            return reject(err.data);
          }
          return reject(err);
        });
    });
  }
}

API.$inject = [
  '$http',
  'Auth',
  'ENV',
  'LocalStorageService',
];

export default API;
