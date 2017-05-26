import Injectable from 'utils/injectable';

class AppService extends Injectable {
  constructor(...injections) {
    super(AppService.$inject, injections);
    this.frameColumnOpen = false;
  }

  toggleOpenFrameColumn() {
    this.frameColumnOpen = !this.frameColumnOpen;
  }

  getProxyUrl(url) {
    // only proxy http requests, not https
    if(url && url.substring(0, 5) === 'http:') {
      return this.ENV.apiEndpoint + '/proxy?url=' + url;
    } else {
      return url;
    }
  }
}
AppService.$inject = ['ENV'];

export default AppService;
