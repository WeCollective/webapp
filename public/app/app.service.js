import Injectable from 'utils/injectable';

const getCSSAligner = () => {
  const vw = window.innerWidth;
  const CSSSContentMax = 1011;
  const CSSScreenMd = 768;
  const CSSScreenLg = 992;
  const CSSSidebarWSm = 201;
  const CSSSidebarWMd = 201;
  const CSSSidebarWLg = 249;

  if (vw < CSSScreenMd) {
    return CSSSidebarWSm + CSSSContentMax;
  }
  else if (vw >= CSSScreenMd && vw < CSSScreenLg) {
    return CSSSidebarWMd + CSSSContentMax;
  }

  return CSSSidebarWLg + CSSSContentMax;
};

class AppService extends Injectable {
  constructor(...injections) {
    super(AppService.$inject, injections);
    this.docked = null;
    this.isSidebarOpen = false;
  }

  applyState() {
    const action = this.isSidebarOpen ? 'add' : 'remove';
    const CLASS_NAME = 'toggled';
    const content = document.getElementsByClassName('center')[0];
    const header = document.getElementsByClassName('header style--fixed')[0];

    if (content) content.classList[action](CLASS_NAME);
    if (header) header.classList[action](CLASS_NAME);
  }

  getProxyUrl(url) {
    // only proxy http requests, not https
    return url && url.substring(0, 5) === 'http:' ? `${this.ENV.apiEndpoint}/proxy?url=${url}` : url;
  }

  resizeCallback(didTransitionState) {
    if (didTransitionState) {
      this.docked = null;
    }

    const className = 'docked';
    const vw = window.innerWidth;
    const left = (vw * 0.5) - (getCSSAligner() / 2);

    if (left <= 0 && !this.docked) {
      const sidebar = document.getElementsByClassName('sidebar')[0];
      if (sidebar) {
        sidebar.classList.add(className);
        this.docked = true;
      }
    }
    else if (left > 0 && this.docked) {
      const sidebar = document.getElementsByClassName('sidebar')[0];
      if (sidebar) {
        sidebar.classList.remove(className);
        this.docked = false;
      }
    }
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
