import Injectable from 'utils/injectable';

class AppService extends Injectable {
  constructor (...injections) {
    super(AppService.$inject, injections);
    this.frameColumnOpen = false;
  }

  getProxyUrl (url) {
    // only proxy http requests, not https
    return url && url.substring(0, 5) === 'http:' ? `${this.ENV.apiEndpoint}/proxy?url=${url}` : url;
  }

  toggleOpenFrameColumn () {
    this.frameColumnOpen = !this.frameColumnOpen;
  }
}

AppService.$inject = [
  'ENV'
];

export default AppService;