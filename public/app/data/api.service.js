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

  request(method, url, params, data) {
    return new Promise(function(resolve, reject) {
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: this.makeFormEncoded,
        transformResponse: this.normaliseResponse
      };
      if(method === 'PUT' || method === 'POST') req.data = data;
      this.$http(req).then(resolve, reject);
    }.bind(this));
  }

  fetch(url, params) { return this.request('GET', url, params); }
  save(url, params) { return this.request('POST', url, params); }
  update(url, params) { return this.request('PUT', url, params); }
  delete(url, params) { return this.request('DELETE', url, params); }
}
API.$inject = ['$http', 'ENV'];

export default API;
