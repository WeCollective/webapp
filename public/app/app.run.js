import Injectable from 'utils/injectable';

class AppRun extends Injectable {
  constructor(...injections) {
    super(AppRun.$inject, injections);

    // Tell Prerender.io to cache when DOM is loaded
    this.$timeout( _ => { this.$window.prerenderReady = true; });

    // state access controls
    // Params: event, toState, toParams, fromState, fromParams
    this.$rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
      let mods = [];

      this.EventService.emit('$stateChangeSuccess');

      const getMods = cb => {
        this.ModService.fetchByBranch(toParams.branchid)
          .then( branchMods => {
            mods = branchMods;
            cb();
          }, cb);
      };

      const doChecks = _ => {
        // If state requires authenticated user to be the user specified in the URL,
        // transition to the specified redirection state
        this.UserService.fetch('me')
          .then( me => {
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
                this.$state.transitionTo(toState.redirectTo);
                event.preventDefault();
              }
            }
          })
          .catch( err => {
            if (err) {
              this.$state.transitionTo(toState.redirectTo);
              event.preventDefault();
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
  'EventService',
  'ModService',
  'UserService'
];

export default AppRun;