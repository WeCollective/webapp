import Injectable from 'utils/injectable.js';
import angular from 'angular';

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

    // cache
    angular.extend(this.CacheFactoryProvider.defaults, {
      maxAge: 3600000,
      deleteOnExpire: 'aggressive',
      onExpire: function (key, value) {
        angular.injector(['ng']).get('$http').get(key).success(function (data) {
          this.put(key, data);
        }.bind(this));
      }
    });
  }
}
AppConfig.$inject = ['markedProvider', '$sceDelegateProvider', 'AnalyticsProvider', 'ENV', 'CacheFactoryProvider'];

export default AppConfig;
