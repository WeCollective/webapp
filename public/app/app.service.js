import Injectable from 'utils/injectable';

class AppService extends Injectable {
  constructor(...injections) {
    super(AppService.$inject, injections);
    this.isNavbarMenuOpen = false;
    this.isSidebarOpen = false;
  }

  applyState() {
    const action = this.isSidebarOpen ? 'add' : 'remove';
    const CLASS_NAME = 'toggled';
    const content = document.getElementsByClassName('center')[0];
    const header = document.getElementsByClassName('header')[0];

    if (content) content.classList[action](CLASS_NAME);
    if (header) header.classList[action](CLASS_NAME);
  }

  getProxyUrl(url) {
    // only proxy http requests, not https
    return url && url.substring(0, 5) === 'http:' ? `${this.ENV.apiEndpoint}/proxy?url=${url}` : url;
  }

  hasTouch() {
    const { navigator = {} } = window;
    return 'ontouchstart' in document.documentElement
       || navigator.maxTouchPoints > 0
       || navigator.msMaxTouchPoints > 0;
  }

  toggleNavbarMenu(state = !this.isNavbarMenuOpen) {
    this.isNavbarMenuOpen = state;
  }

  toggleSidebar(state = !this.isSidebarOpen) {
    this.isSidebarOpen = state;
    this.applyState();
  }
}

AppService.$inject = [
  'ENV',
];

export default AppService;
