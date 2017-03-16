import Injectable from 'utils/injectable.js';

class AppConfig extends Injectable {
  constructor(...injections) {
    super(AppConfig.$inject, injections);

    // GitHub flavoured markdown
    this.markedProvider.setOptions({
      gfm: true,
      sanitize: true
    });

    // whitelist YouTube urls with Angular's sanitizer to allow video embedding
    this.$sceDelegateProvider.resourceUrlWhitelist([
      'self',
      '*://www.youtube.com/**'
    ]);

    // analytics
    this.AnalyticsProvider.setAccount('UA-84400255-1');
    if(this.ENV.name === 'production') {
      this.AnalyticsProvider.setDomainName('weco.io');
    } else {
      this.AnalyticsProvider.setDomainName('none');
    }
    this.AnalyticsProvider.setPageEvent('$stateChangeSuccess');
    this.AnalyticsProvider.logAllCalls(true);
  }
}
AppConfig.$inject = ['markedProvider', '$sceDelegateProvider', 'AnalyticsProvider', 'ENV'];

export default AppConfig;
