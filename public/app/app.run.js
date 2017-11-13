import Injectable from 'utils/injectable';

const THROTTLE = 25;

const getCSSAligner = () => {
  const vw = window.innerWidth;
  const CSSSContentMax = 1011;
  const CSSScreenMd = 768;
  const CSSScreenLg = 992;
  const CSSSidebarWSm = 149;
  const CSSSidebarWMd = 201;
  const CSSSidebarWLg = 249;

  if (vw < CSSScreenMd) {
    return CSSSidebarWSm + CSSSContentMax;
  }
  else if (vw >= CSSScreenMd && vw < CSSScreenLg) {
    return CSSSidebarWMd + CSSSContentMax;
  }

  return CSSSidebarWLg + CSSSContentMax;
};

class AppRun extends Injectable {
  constructor(...injections) {
    super(AppRun.$inject, injections);

    this.docked = null;
    this.timer = null;

    // Tell Prerender.io to cache when DOM is loaded
    this.$timeout(() => this.$window.prerenderReady = true);

    // State access controls.
    // Params: event, toState, toParams, fromState, fromParams
    this.$rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
      let mods = [];

      this.AppService.applyState();
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
            if (toState.selfOnly &&
              (!Object.keys(me).length || toParams.username !== me.username)) {
              this.$state.transitionTo(toState.redirectTo);
              event.preventDefault();
            }

            // If state requires authenticated user to be a mod of the branch specified in the URL,
            // transition to the specified redirection state
            if (toState.modOnly) {
              let isMod = false;

              for (let i = 0; i < mods.length; i += 1) {
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

    window.addEventListener('resize', () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(this.resizeCallback, THROTTLE);
    });

    // Run on init too.
    this.$rootScope.$on('$stateChangeSuccess', () => {
      this.AppService.applyState();
      this.docked = null;
      this.$timeout(() => this.resizeCallback());
    });
  }

  resizeCallback() {
    const className = 'docked';
    const vw = window.innerWidth;
    const left = (vw * 0.5) - (getCSSAligner() / 2);

    if (left <= 0 && !this.docked) {
      const sidebar = document.getElementsByClassName('sidebar')[0];
      if (sidebar) {
        sidebar.classList.add(className);
        this.docked = true;
      }
    }
    else if (left > 0 && this.docked) {
      const sidebar = document.getElementsByClassName('sidebar')[0];
      if (sidebar) {
        sidebar.classList.remove(className);
        this.docked = false;
      }
    }
  }
}

AppRun.$inject = [
  '$rootScope',
  '$state',
  '$timeout',
  '$window',
  // Analytics must be injected at least once to work properly, even if unused.
  'Analytics',
  'AppService',
  'EventService',
  'ModService',
  'UserService',
];

export default AppRun;
