import Injectable from 'utils/injectable';

class AppRoutes extends Injectable {
  constructor(...injections) {
    super(AppRoutes.$inject, injections);

    this.$httpProvider.defaults.withCredentials = true;
    this.$locationProvider.html5Mode(true);
    this.$urlRouterProvider.otherwise('/');

    // Remove trailing slashes from URLs.
    this.$urlRouterProvider.rule( ($injector, $location) => {
      let path = $location.path();
      const hasTrailingSlash = path[path.length - 1] === '/';
      if (hasTrailingSlash) {
        return path.substr(0, path.length - 1);
      }
    });

    this.$stateProvider
      .state('auth', {
        abstract: true,
        templateUrl: '/app/pages/auth/view.html',
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
        template: `<nav-bar></nav-bar><div ng-class="{ 'full-page-nav': App.hasNavBar(), 'full-page': !App.hasNavBar() }" ui-view></div>`
      })
      
      // 404 Not Found
      .state('weco.notfound', {
        templateUrl: '/app/pages/notfound/view.html'
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
        controller: 'ProfileNotificationsController',
        controllerAs: 'ProfileNotifications',
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
        templateUrl: '/app/pages/branch/nucleus/about/about.view.html',
        controller: 'BranchNucleusAboutController',
        controllerAs: 'BranchNucleusAbout'
      })
      
      .state('weco.branch.nucleus.settings', {
        url: '/settings',
        templateUrl: '/app/pages/branch/nucleus/settings/settings.view.html',
        controller: 'BranchNucleusSettingsController',
        controllerAs: 'BranchNucleusSettings',
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
        controller: 'BranchNucleusModtoolsController',
        controllerAs: 'BranchNucleusModtools',
        modOnly: true,
        redirectTo: 'auth.login'
      })
      
      .state('weco.branch.nucleus.flaggedposts', {
        url: '/flaggedposts',
        templateUrl: '/app/pages/branch/nucleus/flagged-posts/flagged-posts.view.html',
        controller: 'BranchNucleusFlaggedPostsController',
        controllerAs: 'BranchNucleusFlaggedPosts',
        modOnly: true,
        redirectTo: 'auth.login'
      })
      
      // Subbranches
      .state('weco.branch.subbranches', {
        url: '/childbranches',
        templateUrl: '/app/pages/branch/subbranches/subbranches.view.html',
        controller: 'BranchSubbranchesController',
        controllerAs: 'BranchSubbranches',
        pageTrack: '/b/:branchid/childbranches'
      })
      
      // Branch wall
      .state('weco.branch.wall', {
        url: '/wall',
        templateUrl: '/app/pages/branch/wall/view.html',
        controller: 'BranchWallController',
        controllerAs: 'BranchWall',
        pageTrack: '/b/:branchid/wall'
      })
      
      // Posts
      .state('weco.branch.post', {
        url: '/p/:postid',
        templateUrl: '/app/pages/branch/post/view.html',
        controller: 'BranchPostController',
        controllerAs: 'BranchPost',
        pageTrack: '/p/:postid'
      })
      
      // Comment Permalink
      .state('weco.branch.post.comment', {
        url: '/c/:commentid',
        templateUrl: '/app/pages/branch/post/discussion/view.html',
        pageTrack: '/p/:postid/c/:commentid'
      })
      
      // Poll Tabs
      .state('weco.branch.post.vote', {
        url: '/vote',
        templateUrl: '/app/pages/branch/post/vote/view.html',
        controller: 'BranchPostVoteController',
        controllerAs: 'BranchPostVote',
        pageTrack: '/p/:postid/vote'
      })
      
      .state('weco.branch.post.results', {
        url: '/results',
        templateUrl: '/app/pages/branch/post/results/view.html',
        controller: 'BranchPostResultsController',
        controllerAs: 'BranchPostResults',
        pageTrack: '/p/:postid/results'
      })
      
      .state('weco.branch.post.discussion', {
        url: '/discussion',
        templateUrl: '/app/pages/branch/post/discussion/view.html',
        pageTrack: '/p/:postid/discussion'
      });

    // Default child states.
    this.$urlRouterProvider.when('/u/{username}', '/u/{username}/about');
    this.$urlRouterProvider.when('/b/{branchid}', '/b/{branchid}/wall');

    // 404 redirect.
    this.$urlRouterProvider.otherwise( ($injector, $location) => {
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
  '$urlRouterProvider'
];

export default AppRoutes;