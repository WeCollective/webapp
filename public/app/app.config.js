import angular from 'angular';
import Injectable from 'utils/injectable';

class AppConfig extends Injectable {
  constructor(...injections) {
    super(AppConfig.$inject, injections);

    // GitHub flavoured markdown
    this.markedProvider.setOptions({
      gfm: true,
      sanitize: true,
    });

    // whitelist YouTube urls with Angular's sanitizer to allow video embedding
    this.$sceDelegateProvider.resourceUrlWhitelist([
      'self',
      '*://www.youtube.com/**',
    ]);

    // Google Analytics
    this.AnalyticsProvider
      .setAccount('UA-84400255-1')
      .setDomainName(this.ENV.name === 'production' ? 'weco.io' : 'none')
      .setPageEvent('$stateChangeSuccess')
      .logAllCalls(true)
      .enterDebugMode(this.ENV.name !== 'production');

    // cache
    angular.extend(this.CacheFactoryProvider.defaults, {
      deleteOnExpire: 'aggressive',
      maxAge: 3600000,
      onExpire: key => {
        angular.injector(['ng'])
          .get('$http')
          .get(key)
          .success(function (data) {
            this.put(key, data);
          }.bind(this));
      },
    });
  }
}

AppConfig.$inject = [
  '$sceDelegateProvider',
  'AnalyticsProvider',
  'CacheFactoryProvider',
  'ENV',
  'markedProvider',
];

export default AppConfig;
