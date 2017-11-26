import Injectable from 'utils/injectable';

class AppRoutes extends Injectable {
  constructor(...injections) {
    super(AppRoutes.$inject, injections);

    this.$httpProvider.defaults.withCredentials = true;
    this.$locationProvider.html5Mode(true);

    // Remove trailing slashes from URLs.
    // Do not touch the undefined return statement. Removing it upsets the linter,
    // changing its value to anything else breaks the router.
    this.$urlRouterProvider.rule(($injector, $location) => {
      const path = $location.path();
      const hasTrailingSlash = path[path.length - 1] === '/';
      if (hasTrailingSlash) {
        return path.substr(0, path.length - 1);
      }
      return undefined;
    });

    this.$stateProvider
      .state('auth', {
        abstract: true,
        templateUrl: '/app/pages/auth/view.html',
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
        templateUrl: '/app/pages/auth/verify/view.html',
        controller: 'VerifyController',
        controllerAs: 'Verify',
      })

      .state('reset-password', {
        url: '/reset-password',
        abstract: true,
        templateUrl: '/app/pages/auth/reset-password/view.html',
        controller: 'ResetPasswordController',
        controllerAs: 'ResetPassword',
      })

      .state('reset-password.request', {
        url: '/request',
        templateUrl: '/app/pages/auth/reset-password/request/view.html',
      })

      .state('reset-password.confirm', {
        url: '/:username/:token',
        templateUrl: '/app/pages/auth/reset-password/confirm/view.html',
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
        templateUrl: '/app/pages/notfound/view.html',
      })

      // Homepage state
      .state('weco.home', {
        url: '/',
        templateUrl: '/app/pages/home/view.html',
        controller: 'HomeController',
        controllerAs: 'Home',
        pageTrack: '/',
      })

      // Profile page
      .state('weco.profile', {
        url: '/u/:username',
        abstract: true,
        templateUrl: '/app/pages/profile/view.html',
        controller: 'ProfileController',
        controllerAs: 'Profile',
      })

      .state('weco.profile.about', {
        url: '/about',
        templateUrl: '/app/pages/profile/about/view.html',
        pageTrack: '/u/:username/about',
      })

      .state('weco.profile.settings', {
        url: '/settings',
        templateUrl: '/app/pages/profile/settings/view.html',
        controller: 'ProfileSettingsController',
        controllerAs: 'ProfileSettings',
        pageTrack: '/u/:username/settings',
      })

      .state('weco.profile.notifications', {
        url: '/notifications',
        templateUrl: '/app/pages/profile/notifications/view.html',
        controller: 'ProfileNotificationsController',
        controllerAs: 'Ctrl',
        pageTrack: '/u/:username/notifications',
      })

      // Branches
      .state('weco.branch', {
        url: '/b/:branchid',
        abstract: true,
        templateUrl: '/app/pages/branch/view.html',
        controller: 'BranchController',
        controllerAs: 'Branch',
      })

      // Branch Nucleus
      .state('weco.branch.nucleus', {
        url: '/nucleus',
        abstract: true,
        pageTrack: '/b/:branchid/nucleus',
        views: {
          content: {
            templateUrl: '/app/pages/branch/nucleus/view.html',
            controller: 'BranchNucleusController',
            controllerAs: 'BranchNucleus',
          },
          header: {
            templateUrl: '/app/pages/branch/nucleus/header/view.html',
            controller: 'BranchNucleusHeaderController',
            controllerAs: 'Ctrl',
          },
        },
      })

      .state('weco.branch.nucleus.about', {
        url: '/about',
        templateUrl: '/app/pages/branch/nucleus/about/view.html',
        controller: 'BranchNucleusAboutController',
        controllerAs: 'BranchNucleusAbout',
      })

      .state('weco.branch.nucleus.settings', {
        url: '/settings',
        templateUrl: '/app/pages/branch/nucleus/settings/view.html',
        controller: 'BranchNucleusSettingsController',
        controllerAs: 'BranchNucleusSettings',
      })

      .state('weco.branch.nucleus.moderators', {
        url: '/moderators',
        templateUrl: '/app/pages/branch/nucleus/moderators/view.html',
        controller: 'BranchNucleusModeratorsController',
        controllerAs: 'BranchNucleusModerators',
      })

      .state('weco.branch.nucleus.modtools', {
        url: '/modtools',
        templateUrl: '/app/pages/branch/nucleus/modtools/view.html',
        controller: 'BranchNucleusModtoolsController',
        controllerAs: 'ToolsCtrl',
      })

      .state('weco.branch.nucleus.flaggedposts', {
        url: '/flaggedposts',
        templateUrl: '/app/pages/branch/nucleus/flagged-posts/view.html',
        controller: 'BranchNucleusFlaggedPostsController',
        controllerAs: 'FlaggedPosts',
      })

      // Subbranches
      .state('weco.branch.subbranches', {
        url: '/childbranches',
        pageTrack: '/b/:branchid/childbranches',
        views: {
          content: {
            templateUrl: '/app/pages/branch/subbranches/view.html',
            controller: 'BranchSubbranchesController',
            controllerAs: 'Ctrl',
          },
          header: {
            templateUrl: '/app/pages/branch/subbranches/header/view.html',
            controller: 'BranchSubbranchesHeaderController',
            controllerAs: 'Ctrl',
          },
        },
      })

      // Branch wall
      .state('weco.branch.wall', {
        url: '/wall',
        pageTrack: '/b/:branchid/wall',
        views: {
          content: {
            templateUrl: '/app/pages/branch/wall/view.html',
            controller: 'BranchWallController',
            controllerAs: 'Ctrl',
          },
          header: {
            templateUrl: '/app/pages/branch/wall/header/view.html',
            controller: 'BranchWallHeaderController',
            controllerAs: 'Ctrl',
          },
        },
      })

      // Posts
      .state('weco.branch.post', {
        url: '/p/:postid',
        pageTrack: '/p/:postid',
        views: {
          content: {
            templateUrl: '/app/pages/branch/post/view.html',
            controller: 'BranchPostController',
            controllerAs: 'Ctrl',
          },
          header: {
            templateUrl: '/app/pages/branch/post/header/view.html',
            controller: 'BranchPostHeaderController',
            controllerAs: 'Ctrl',
          },
        },
      })

      // Comment Permalink
      .state('weco.branch.post.comment', {
        url: '/c/:commentid',
        templateUrl: '/app/pages/branch/post/discussion/view.html',
        pageTrack: '/p/:postid/c/:commentid',
      })

      // Poll Tabs
      .state('weco.branch.post.vote', {
        url: '/vote',
        templateUrl: '/app/pages/branch/post/vote/view.html',
        controller: 'BranchPostVoteController',
        controllerAs: 'BranchPostVote',
        pageTrack: '/p/:postid/vote',
      })

      .state('weco.branch.post.results', {
        url: '/results',
        templateUrl: '/app/pages/branch/post/results/view.html',
        controller: 'BranchPostResultsController',
        controllerAs: 'BranchPostResults',
        pageTrack: '/p/:postid/results',
      })

      .state('weco.branch.post.discussion', {
        url: '/discussion',
        templateUrl: '/app/pages/branch/post/discussion/view.html',
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
