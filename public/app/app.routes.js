import Injectable from 'utils/injectable.js';

class AppRoutes extends Injectable {
  constructor(...injections) {
    super(AppRoutes.$inject, injections);

    this.$httpProvider.defaults.withCredentials = true;
    this.$locationProvider.html5Mode(true);
    this.$urlRouterProvider.otherwise('/');

    // remove trailing slashes from URL
    this.$urlRouterProvider.rule(function($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path[path.length-1] === '/';
      if(hasTrailingSlash) {
        //if last charcter is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        return newPath;
      }
    });

    this.$stateProvider
      // Log In/Sign Up state
      .state('auth', {
        abstract: true,
        templateUrl: '/app/pages/auth/auth.view.html',
        controller: 'AuthController',
        controllerAs: 'Auth'
      })
      .state('auth.login', {
        url: '/login'
      })
      .state('auth.signup', {
        url: '/signup'
      })
      .state('verify', {
        url: '/:username/verify/:token',
        templateUrl: '/app/pages/auth/verify/verify.view.html',
        controller: 'VerifyController',
        controllerAs: 'Verify'
      })
      .state('reset-password', {
        url: '/reset-password',
        abstract: true,
        templateUrl: '/app/pages/auth/reset-password/reset-password.view.html',
        controller: 'ResetPasswordController',
        controllerAs: 'ResetPassword'
      })
      .state('reset-password.request', {
        url: '/request',
        templateUrl: '/app/pages/auth/reset-password/request/request.view.html'
      })
      .state('reset-password.confirm', {
        url: '/:username/:token',
        templateUrl: '/app/pages/auth/reset-password/confirm/confirm.view.html'
      })
      // Abstract root state contains nav-bar
      .state('weco', {
        abstract: true,
        template: '<nav-bar></nav-bar><div ng-class="{ \'full-page-nav\': App.hasNavBar(), \'full-page\': !App.hasNavBar() }" ui-view></div>'
      })
      // 404 Not Found
      .state('weco.notfound', {
        templateUrl: '/app/pages/notfound/notfound.view.html'
      })
      // Homepage state
      .state('weco.home', {
        url: '/',
        templateUrl: '/app/pages/home/home.view.html',
        controller: 'HomeController',
        controllerAs: 'Home',
        pageTrack: '/'
      })
      // Profile page
      .state('weco.profile', {
        url: '/u/:username',
        abstract: true,
        templateUrl: '/app/pages/profile/profile.view.html',
        controller: 'ProfileController',
        controllerAs: 'Profile'
      })
      .state('weco.profile.about', {
        url: '/about',
        templateUrl: '/app/pages/profile/about/about.view.html',
        pageTrack: '/u/:username/about'
      })
      .state('weco.profile.settings', {
        url: '/settings',
        templateUrl: '/app/pages/profile/settings/settings.view.html',
        controller: 'ProfileSettingsController',
        controllerAs: 'ProfileSettings',
        selfOnly: true,
        redirectTo: 'auth.login',
        pageTrack: '/u/:username/settings'
      })
      .state('weco.profile.notifications', {
        url: '/notifications',
        templateUrl: '/app/pages/profile/notifications/notifications.view.html',
        selfOnly: true,
        redirectTo: 'auth.login',
        pageTrack: '/u/:username/notifications'
      })
      // Branches
      .state('weco.branch', {
        url: '/b/:branchid',
        abstract: true,
        templateUrl: '/app/pages/branch/branch.view.html',
        controller: 'BranchController',
        controllerAs: 'Branch'
      })
      // Branch Nucleus
      .state('weco.branch.nucleus', {
        url: '/nucleus',
        abstract: true,
        templateUrl: '/app/pages/branch/nucleus/nucleus.view.html',
        controller: 'BranchNucleusController',
        controllerAs: 'BranchNucleus',
        pageTrack: '/b/:branchid/nucleus'
      })
      .state('weco.branch.nucleus.about', {
        url: '/about',
        templateUrl: '/app/pages/branch/nucleus/about/about.view.html'
      })
      .state('weco.branch.nucleus.settings', {
        url: '/settings',
        templateUrl: '/app/pages/branch/nucleus/settings/settings.view.html',
        modOnly: true,
        redirectTo: 'auth.login'
      })
      .state('weco.branch.nucleus.moderators', {
        url: '/moderators',
        templateUrl: '/app/pages/branch/nucleus/moderators/moderators.view.html',
        controller: 'BranchNucleusModeratorsController',
        controllerAs: 'BranchNucleusModerators'
      })
      .state('weco.branch.nucleus.modtools', {
        url: '/modtools',
        templateUrl: '/app/pages/branch/nucleus/modtools/modtools.view.html',
        modOnly: true,
        redirectTo: 'auth.login'
      })
      .state('weco.branch.nucleus.flaggedposts', {
        url: '/flaggedposts',
        templateUrl: '/app/pages/branch/nucleus/flaggedposts/flaggedposts.view.html',
        modOnly: true,
        redirectTo: 'auth.login'
      })
      // Subbranches
      .state('weco.branch.subbranches', {
        url: '/childbranches',
        templateUrl: '/app/pages/branch/subbranches/subbranches.view.html',
        pageTrack: '/b/:branchid/childbranches'
      })
      // Branch wall
      .state('weco.branch.wall', {
        url: '/wall',
        templateUrl: '/app/pages/branch/wall/wall.view.html',
        pageTrack: '/b/:branchid/wall'
      })
      // Posts
      .state('weco.branch.post', {
        url: '/p/:postid',
        templateUrl: '/app/pages/branch/post/post.view.html',
        pageTrack: '/p/:postid'
      })
      // Comment Permalink
      .state('weco.branch.post.comment', {
        url: '/c/:commentid',
        pageTrack: '/p/:postid/c/:commentid'
      })
      // Poll Tabs
      .state('weco.branch.post.vote', {
        url: '/vote',
        pageTrack: '/p/:postid/vote'
      })
      .state('weco.branch.post.results', {
        url: '/results',
        pageTrack: '/p/:postid/results'
      })
      .state('weco.branch.post.discussion', {
        url: '/discussion',
        pageTrack: '/p/:postid/discussion'
      });

    // default child states
    this.$urlRouterProvider.when('/u/{username}', '/u/{username}/about');
    this.$urlRouterProvider.when('/b/{branchid}', '/b/{branchid}/wall');

    // 404 redirect
    this.$urlRouterProvider.otherwise(function($injector, $location) {
      var state = this.$injector.get('$state');
      state.go('weco.notfound');
      return this.$location.path();
    });
  }
}
AppRoutes.$inject = ['$httpProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider'];

export default AppRoutes;
