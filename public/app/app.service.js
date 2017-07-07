import Injectable from 'utils/injectable';

class AppService extends Injectable {
  constructor(...injections) {
    super(AppService.$inject, injections);
    this.isSidebarOpen = false;
  }

  getProxyUrl(url) {
    // only proxy http requests, not https
    return url && url.substring(0, 5) === 'http:' ? `${this.ENV.apiEndpoint}/proxy?url=${url}` : url;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}

AppService.$inject = [
  'ENV',
];

export default AppService;
