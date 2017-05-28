import Injectable from 'utils/injectable';

class API extends Injectable {
  constructor(...injections) {
    super(API.$inject, injections);
  }

  makeFormEncoded(data, headersGetter) {
    let str = [];
    for(let d in data) {
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return str.join("&");
  }

  normaliseResponse(data, headersGetter, status) {
    try {
      data = JSON.parse(data);
      data.status = status;
      return data;
    } catch(e) {
      return data;
    }
  }

  request(method, url, params, data, urlFormEncode) {
    return new Promise((resolve, reject) => {
      // ensure url has a leading slash
      if(url[0] !== '/') url = '/' + url;

      // replace :params in the url with their specified values
      for(let paramName of Object.keys(params)) {
        url = url.replace(new RegExp(':' + paramName, 'g'), params[paramName]);
      }

      // make the request
      let req = {
        method: method,
        url: this.ENV.apiEndpoint + url,
        transformResponse: this.normaliseResponse
      };

      if(!!urlFormEncode) {
        req.headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };
        req.transformRequest = this.makeFormEncoded;
      } else {
        req.headers = {
          'Content-Type': 'application/json'
        };
      }
      if(method === 'PUT' || method === 'POST') req.data = data;
      if(method === 'GET' || method === 'DELETE') req.params = data;
      this.$http(req).then((response) => {
        resolve(response.data || response);
      }, reject);
    });
  }

  fetch(url, params, data, urlFormEncode) { return this.request('GET', url, params, data, urlFormEncode); }
  save(url, params, data, urlFormEncode) { return this.request('POST', url, params, data, urlFormEncode); }
  update(url, params, data, urlFormEncode) { return this.request('PUT', url, params, data, urlFormEncode); }
  remove(url, params, data, urlFormEncode) { return this.request('DELETE', url, params, data, urlFormEncode); }
}
API.$inject = ['$http', 'ENV'];

export default API;
