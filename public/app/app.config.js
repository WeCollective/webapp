import angular from 'angular';
import constEnvironment from 'env.config';
import Injectable from 'utils/injectable';

class AppConfig extends Injectable {
  constructor(...injections) {
    super(AppConfig.$inject, injections);

    const UA = this.ENV.name === 'production' ? 'UA-84400255-1' : 'UA-84400255-2';

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

    // cache
    angular.extend(this.CacheFactoryProvider.defaults, {
      deleteOnExpire: 'aggressive',
      maxAge: 3600000,
      onExpire: key => {
        angular.injector(['ng'])
          .get('$http')
          .get(key)
          .success(function (data) { // eslint-disable-line prefer-arrow-callback, func-names
            this.put(key, data);
          }.bind(this));
      },
    });
  }
}

AppConfig.$inject = [
  '$sceDelegateProvider',
  'CacheFactoryProvider',
  'ENV',
  'markedProvider',
];

export default AppConfig;
