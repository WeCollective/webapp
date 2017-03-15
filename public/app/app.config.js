let AppConfig = {
  markdown: (markedProvider) => {
    markedProvider.setOptions({
      gfm: true,      // GitHub flavoured markdown
      sanitize: true
    });
  },
  urlWhitelist: ($sceDelegateProvider) => {
    // whitelist YouTube urls with Angular's sanitizer to allow video embedding
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      '*://www.youtube.com/**'
    ]);
  },
  analytics: (AnalyticsProvider, ENV) => {
    AnalyticsProvider.setAccount('UA-84400255-1');
    if(ENV.name === 'production') {
      AnalyticsProvider.setDomainName('weco.io');
    } else {
      AnalyticsProvider.setDomainName('none');
    }
    // Using ui-router, which fires $stateChangeSuccess instead of $routeChangeSuccess
    AnalyticsProvider.setPageEvent('$stateChangeSuccess');
    AnalyticsProvider.logAllCalls(true);
  }
};
export default AppConfig;
