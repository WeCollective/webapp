import Injectable from 'utils/injectable';

class API extends Injectable {
  constructor(...injections) {
    super(API.$inject, injections);
  }
  makeFormEncoded(data, headersGetter) {
    let str = [];
    for (let d in data)
      str.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return str.join("&");
  }
  request(method, url, params, data) {
    return new Promise(function(resolve, reject) {
      if(url[0] !== '/') url = '/' + url;
      for(let paramName of Object.keys(params)) {
        url = url.replace(new RegExp(':' + paramName, 'g'), params[paramName]);
      }
      let req = {
        method: method,
        url: this.ENV.apiEndpoint + url,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: this.makeFormEncoded
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
