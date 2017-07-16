import angular from 'angular';
import constEnvironment from 'env.config';
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

    if (this.ENV.name === 'production') {
      this.AnalyticsProvider.setAccount('UA-84400255-1');
    }
    else {
      this.AnalyticsProvider.setAccount('UA-84400255-2');
    }

    // Google Analytics.
    this.AnalyticsProvider
      .setPageEvent('$stateChangeSuccess')
      .logAllCalls(true);

    if (constEnvironment.debugAnalytics === true && this.ENV.name !== 'production') {
      this.AnalyticsProvider.enterDebugMode(true);
    }

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
