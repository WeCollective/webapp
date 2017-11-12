import Injectable from 'utils/injectable';

import AuthView from 'pages/auth/view.html';
import AuthResetPasswordView from 'pages/auth/reset-password/view.html';
import AuthResetPasswordConfirmView from 'pages/auth/reset-password/confirm/view.html';
import AuthResetPasswordRequestView from 'pages/auth/reset-password/request/view.html';
import AuthVerifyView from 'pages/auth/verify/view.html';
import BranchView from 'pages/branch/view.html';
import BranchNucleusView from 'pages/branch/nucleus/view.html';
import BranchNucleusAboutView from 'pages/branch/nucleus/about/view.html';
import BranchNucleusFlaggedPostsView from 'pages/branch/nucleus/flagged-posts/view.html';
import BranchNucleusModeratorsView from 'pages/branch/nucleus/moderators/view.html';
import BranchNucleusModToolsView from 'pages/branch/nucleus/modtools/view.html';
import BranchNucleusSettingsView from 'pages/branch/nucleus/settings/view.html';
import BranchPostView from 'pages/branch/post/view.html';
import BranchPostDiscussionView from 'pages/branch/post/discussion/view.html';
import BranchPostResultsView from 'pages/branch/post/results/view.html';
import BranchPostVoteView from 'pages/branch/post/vote/view.html';
import BranchSubbranchesView from 'pages/branch/subbranches/view.html';
import BranchWallView from 'pages/branch/wall/view.html';
import HomeView from 'pages/home/view.html';
import ErrorNotFoundView from 'pages/notfound/view.html';
import ProfileView from 'pages/profile/view.html';
import ProfileAboutView from 'pages/profile/about/view.html';
import ProfileNotificationsView from 'pages/profile/notifications/view.html';
import ProfileSettingsView from 'pages/profile/settings/view.html';

class AppRoutes extends Injectable {
  constructor(...injections) {
    super(AppRoutes.$inject, injections);

    this.$httpProvider.defaults.withCredentials = true;
    this.$locationProvider.html5Mode(true);
    // this.$urlRouterProvider.otherwise('/');

    console.log('woooo');

    // Remove trailing slashes from URLs.
    this.$urlRouterProvider.rule(($injector, $location) => {
      const path = $location.path();
      const hasTrailingSlash = path[path.length - 1] === '/';
      return hasTrailingSlash ? path.substr(0, path.length - 1) : path;
    });

    this.$stateProvider
      .state('auth', {
        abstract: true,
        controller: 'AuthController',
        controllerAs: 'Auth',
        template: AuthView,
      })

      .state('auth.login', {
        url: '/login',
      })

      .state('auth.signup', {
        url: '/signup',
      })

      .state('verify', {
        url: '/:username/verify/:token',
        controller: 'VerifyController',
        controllerAs: 'Verify',
        template: AuthVerifyView,
      })

      .state('reset-password', {
        url: '/reset-password',
        abstract: true,
        controller: 'ResetPasswordController',
        controllerAs: 'ResetPassword',
        template: AuthResetPasswordView,
      })

      .state('reset-password.request', {
        url: '/request',
        template: AuthResetPasswordRequestView,
      })

      .state('reset-password.confirm', {
        url: '/:username/:token',
        template: AuthResetPasswordConfirmView,
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
        template: ErrorNotFoundView,
      })

      // Homepage state
      .state('weco.home', {
        url: '/',
        controller: 'HomeController',
        controllerAs: 'Home',
        pageTrack: '/',
        template: HomeView,
      })

      // Profile page
      .state('weco.profile', {
        url: '/u/:username',
        abstract: true,
        controller: 'ProfileController',
        controllerAs: 'Profile',
        template: ProfileView,
      })

      .state('weco.profile.about', {
        url: '/about',
        pageTrack: '/u/:username/about',
        template: ProfileAboutView,
      })

      .state('weco.profile.settings', {
        url: '/settings',
        controller: 'ProfileSettingsController',
        controllerAs: 'ProfileSettings',
        pageTrack: '/u/:username/settings',
        template: ProfileSettingsView,
      })

      .state('weco.profile.notifications', {
        url: '/notifications',
        controller: 'ProfileNotificationsController',
        controllerAs: 'ProfileNotifications',
        pageTrack: '/u/:username/notifications',
        template: ProfileNotificationsView,
      })

      // Branches
      .state('weco.branch', {
        url: '/b/:branchid',
        abstract: true,
        controller: 'BranchController',
        controllerAs: 'Branch',
        template: BranchView,
      })

      // Branch Nucleus
      .state('weco.branch.nucleus', {
        url: '/nucleus',
        abstract: true,
        controller: 'BranchNucleusController',
        controllerAs: 'BranchNucleus',
        pageTrack: '/b/:branchid/nucleus',
        template: BranchNucleusView,
      })

      .state('weco.branch.nucleus.about', {
        url: '/about',
        controller: 'BranchNucleusAboutController',
        controllerAs: 'BranchNucleusAbout',
        template: BranchNucleusAboutView,
      })

      .state('weco.branch.nucleus.settings', {
        url: '/settings',
        controller: 'BranchNucleusSettingsController',
        controllerAs: 'BranchNucleusSettings',
        template: BranchNucleusSettingsView,
      })

      .state('weco.branch.nucleus.moderators', {
        url: '/moderators',
        controller: 'BranchNucleusModeratorsController',
        controllerAs: 'BranchNucleusModerators',
        template: BranchNucleusModeratorsView,
      })

      .state('weco.branch.nucleus.modtools', {
        url: '/modtools',
        controller: 'BranchNucleusModtoolsController',
        controllerAs: 'ToolsCtrl',
        template: BranchNucleusModToolsView,
      })

      .state('weco.branch.nucleus.flaggedposts', {
        url: '/flaggedposts',
        controller: 'BranchNucleusFlaggedPostsController',
        controllerAs: 'FlaggedPosts',
        template: BranchNucleusFlaggedPostsView,
      })

      // Subbranches
      .state('weco.branch.subbranches', {
        url: '/childbranches',
        controller: 'BranchSubbranchesController',
        controllerAs: 'Subbranches',
        pageTrack: '/b/:branchid/childbranches',
        template: BranchSubbranchesView,
      })

      // Branch wall
      .state('weco.branch.wall', {
        url: '/wall',
        controller: 'BranchWallController',
        controllerAs: 'BranchWall',
        pageTrack: '/b/:branchid/wall',
        template: BranchWallView,
      })

      // Posts
      .state('weco.branch.post', {
        url: '/p/:postid',
        controller: 'BranchPostController',
        controllerAs: 'BranchPost',
        pageTrack: '/p/:postid',
        template: BranchPostView,
      })

      // Comment Permalink
      .state('weco.branch.post.comment', {
        url: '/c/:commentid',
        pageTrack: '/p/:postid/c/:commentid',
        template: BranchPostDiscussionView,
      })

      // Poll Tabs
      .state('weco.branch.post.vote', {
        url: '/vote',
        controller: 'BranchPostVoteController',
        controllerAs: 'BranchPostVote',
        pageTrack: '/p/:postid/vote',
        template: BranchPostVoteView,
      })

      .state('weco.branch.post.results', {
        url: '/results',
        controller: 'BranchPostResultsController',
        controllerAs: 'BranchPostResults',
        pageTrack: '/p/:postid/results',
        template: BranchPostResultsView,
      })

      .state('weco.branch.post.discussion', {
        url: '/discussion',
        pageTrack: '/p/:postid/discussion',
        template: BranchPostDiscussionView,
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
