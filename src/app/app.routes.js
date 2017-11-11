import Injectable from './utils/injectable';

import HomeView from 'pages/home/view.html';

class AppRoutes extends Injectable {
  constructor(...injections) {
    super(AppRoutes.$inject, injections);

    this.$httpProvider.defaults.withCredentials = true;
    this.$locationProvider.html5Mode(true);
    this.$urlRouterProvider.otherwise('/');

    // Remove trailing slashes from URLs.
    this.$urlRouterProvider.rule(($injector, $location) => {
      const path = $location.path();
      const hasTrailingSlash = path[path.length - 1] === '/';
      return hasTrailingSlash ? path.substr(0, path.length - 1) : path;
    });

    this.$stateProvider
      .state('auth', {
        abstract: true,
        templateUrl: 'pages/auth/view.html',
        controller: 'AuthController',
        controllerAs: 'Auth',
      })

      .state('auth.login', {
        url: '/login',
      })

      .state('auth.signup', {
        url: '/signup',
      })

      .state('verify', {
        url: '/:username/verify/:token',
        templateUrl: 'pages/auth/verify/view.html',
        controller: 'VerifyController',
        controllerAs: 'Verify',
      })

      .state('reset-password', {
        url: '/reset-password',
        abstract: true,
        templateUrl: 'pages/auth/reset-password/view.html',
        controller: 'ResetPasswordController',
        controllerAs: 'ResetPassword',
      })

      .state('reset-password.request', {
        url: '/request',
        templateUrl: 'pages/auth/reset-password/request/view.html',
      })

      .state('reset-password.confirm', {
        url: '/:username/:token',
        templateUrl: 'pages/auth/reset-password/confirm/view.html',
      })

      // Abstract root state contains nav-bar
      .state('weco', {
        abstract: true,
        template: `
          <nav-bar></nav-bar>
          <div class="view" ui-view></div>
        `,
      })

      // 404 Not Found
      .state('weco.notfound', {
        templateUrl: 'pages/notfound/view.html',
      })

      // Homepage state
      .state('weco.home', {
        url: '/',
        template: HomeView,
        controller: 'HomeController',
        controllerAs: 'Home',
        pageTrack: '/',
      })

      // Profile page
      .state('weco.profile', {
        url: '/u/:username',
        abstract: true,
        templateUrl: 'pages/profile/view.html',
        controller: 'ProfileController',
        controllerAs: 'Profile',
      })

      .state('weco.profile.about', {
        url: '/about',
        templateUrl: 'pages/profile/about/view.html',
        pageTrack: '/u/:username/about',
      })

      .state('weco.profile.settings', {
        url: '/settings',
        templateUrl: 'pages/profile/settings/view.html',
        controller: 'ProfileSettingsController',
        controllerAs: 'ProfileSettings',
        pageTrack: '/u/:username/settings',
      })

      .state('weco.profile.notifications', {
        url: '/notifications',
        templateUrl: 'pages/profile/notifications/view.html',
        controller: 'ProfileNotificationsController',
        controllerAs: 'ProfileNotifications',
        pageTrack: '/u/:username/notifications',
      })

      // Branches
      .state('weco.branch', {
        url: '/b/:branchid',
        abstract: true,
        templateUrl: 'pages/branch/view.html',
        controller: 'BranchController',
        controllerAs: 'Branch',
      })

      // Branch Nucleus
      .state('weco.branch.nucleus', {
        url: '/nucleus',
        abstract: true,
        templateUrl: 'pages/branch/nucleus/view.html',
        controller: 'BranchNucleusController',
        controllerAs: 'BranchNucleus',
        pageTrack: '/b/:branchid/nucleus',
      })

      .state('weco.branch.nucleus.about', {
        url: '/about',
        templateUrl: 'pages/branch/nucleus/about/view.html',
        controller: 'BranchNucleusAboutController',
        controllerAs: 'BranchNucleusAbout',
      })

      .state('weco.branch.nucleus.settings', {
        url: '/settings',
        templateUrl: 'pages/branch/nucleus/settings/view.html',
        controller: 'BranchNucleusSettingsController',
        controllerAs: 'BranchNucleusSettings',
      })

      .state('weco.branch.nucleus.moderators', {
        url: '/moderators',
        templateUrl: 'pages/branch/nucleus/moderators/view.html',
        controller: 'BranchNucleusModeratorsController',
        controllerAs: 'BranchNucleusModerators',
      })

      .state('weco.branch.nucleus.modtools', {
        url: '/modtools',
        templateUrl: 'pages/branch/nucleus/modtools/view.html',
        controller: 'BranchNucleusModtoolsController',
        controllerAs: 'ToolsCtrl',
      })

      .state('weco.branch.nucleus.flaggedposts', {
        url: '/flaggedposts',
        templateUrl: 'pages/branch/nucleus/flagged-posts/view.html',
        controller: 'BranchNucleusFlaggedPostsController',
        controllerAs: 'FlaggedPosts',
      })

      // Subbranches
      .state('weco.branch.subbranches', {
        url: '/childbranches',
        templateUrl: 'pages/branch/subbranches/view.html',
        controller: 'BranchSubbranchesController',
        controllerAs: 'Subbranches',
        pageTrack: '/b/:branchid/childbranches',
      })

      // Branch wall
      .state('weco.branch.wall', {
        url: '/wall',
        templateUrl: 'pages/branch/wall/view.html',
        controller: 'BranchWallController',
        controllerAs: 'BranchWall',
        pageTrack: '/b/:branchid/wall',
      })

      // Posts
      .state('weco.branch.post', {
        url: '/p/:postid',
        templateUrl: 'pages/branch/post/view.html',
        controller: 'BranchPostController',
        controllerAs: 'BranchPost',
        pageTrack: '/p/:postid',
      })

      // Comment Permalink
      .state('weco.branch.post.comment', {
        url: '/c/:commentid',
        templateUrl: 'pages/branch/post/discussion/view.html',
        pageTrack: '/p/:postid/c/:commentid',
      })

      // Poll Tabs
      .state('weco.branch.post.vote', {
        url: '/vote',
        templateUrl: 'pages/branch/post/vote/view.html',
        controller: 'BranchPostVoteController',
        controllerAs: 'BranchPostVote',
        pageTrack: '/p/:postid/vote',
      })

      .state('weco.branch.post.results', {
        url: '/results',
        templateUrl: 'pages/branch/post/results/view.html',
        controller: 'BranchPostResultsController',
        controllerAs: 'BranchPostResults',
        pageTrack: '/p/:postid/results',
      })

      .state('weco.branch.post.discussion', {
        url: '/discussion',
        templateUrl: 'pages/branch/post/discussion/view.html',
        pageTrack: '/p/:postid/discussion',
      });

    // Default child states.
    this.$urlRouterProvider.when('/u/{username}', '/u/{username}/about');
    this.$urlRouterProvider.when('/b/{branchid}', '/b/{branchid}/wall');

    // 404 redirect.
    this.$urlRouterProvider.otherwise(($injector, $location) => {
      const state = $injector.get('$state');
      state.go('weco.notfound');
      return $location.path();
    });
  }
}

AppRoutes.$inject = [
  '$httpProvider',
  '$locationProvider',
  '$stateProvider',
  '$urlRouterProvider',
];

export default AppRoutes;
