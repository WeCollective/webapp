import Injectable from 'utils/injectable';

class AppRun extends Injectable {
  constructor (...injections) {
    super(AppRun.$inject, injections);

    // Tell Prerender.io to cache when DOM is loaded
    this.$timeout(() => this.$window.prerenderReady = true);

    // State access controls.
    // Params: event, toState, toParams, fromState, fromParams
    this.$rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
      let mods = [];

      this.EventService.emit('$stateChangeSuccess');

      const getMods = cb => {
        this.ModService.fetchByBranch(toParams.branchid)
          .then(branchMods => {
            mods = branchMods;
            cb();
          }, cb);
      };

      const doChecks = () => {
        // If state requires authenticated user to be the user specified in the URL,
        // transition to the specified redirection state
        this.UserService.fetch('me')
          .then(me => {
            if (toState.selfOnly && (!Object.keys(me).length || toParams.username !== me.username)) {
              this.$state.transitionTo(toState.redirectTo);
              event.preventDefault();
            }

            // If state requires authenticated user to be a mod of the branch specified in the URL,
            // transition to the specified redirection state
            if (toState.modOnly) {
              let isMod = false;
              
              for (let i = 0; i < mods.length; i++) {
                if (mods[i].username === me.username) {
                  isMod = true;
                  break;
                }
              }

              if (!isMod) {
                event.preventDefault();
                this.$state.transitionTo(toState.redirectTo);
              }
            }
          })
          .catch(err => {
            if (err) {
              event.preventDefault();
              this.$state.transitionTo(toState.redirectTo);
            }
          });
      };

      // check if the state we are transitioning to has access restrictions,
      // performing checks if needed
      if (toState.modOnly) {
        getMods(doChecks);
      }
      else if (toState.selfOnly) {
        doChecks();
      }
    });
  }
}

AppRun.$inject = [
  '$rootScope',
  '$state',
  '$timeout',
  '$window',
  // Analytics must be injected at least once to work properly, even if unused.
  'Analytics',
  'EventService',
  'ModService',
  'UserService',
];

export default AppRun;
