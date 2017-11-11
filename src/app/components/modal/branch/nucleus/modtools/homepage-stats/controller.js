import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class UpdateHomepageStatsModalController extends Injectable {
  constructor(...injections) {
    super(UpdateHomepageStatsModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = true;
    this.stats = {
      donation_total: 0,
      raised_total: 0,
    };

    const init = () => {
      Generator.run(function* () { // eslint-disable-line func-names
        try {
          let response = yield this.API.get('/constant/donation_total', {});
          this.stats.donation_total = response.data.data;

          response = yield this.API.get('/constant/raised_total', {});
          this.stats.raised_total = response.data.data;
        }
        catch (err) {
          this.AlertsService.push('error', 'Error updating homepage stats.');
          this.ModalService.Cancel();
        }

        this.$timeout(() => this.isLoading = false);
      }, this);
    };

    const listeners = [];

    listeners.push(this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'UPDATE_HOMEPAGE_STATS') return;

      // validate stats
      this.isLoading = true;
      if (Number.isNaN(this.stats.donation_total) || Number.isNaN(this.stats.raised_total)) {
        this.$timeout(() => {
          this.errorMessage = 'Invalid amount';
          this.isLoading = false;
        });
        return;
      }

      // update stats
      Generator.run(function* () { // eslint-disable-line func-names
        try {
          yield this.API.put('/constant/donation_total', {}, {
            data: Number(this.stats.donation_total),
          });

          yield this.API.put('/constant/raised_total', {}, {
            data: Number(this.stats.raised_total),
          });

          this.$timeout(() => {
            this.isLoading = false;
            this.ModalService.OK();
          });
        }
        catch (err) {
          this.AlertsService.push('error', 'Error updating homepage stats.');
          this.ModalService.Cancel();
        }
      }, this);
    }));

    listeners.push(this.EventService.on(this.EventService.events.MODAL_CANCEL, name => {
      if (name !== 'UPDATE_HOMEPAGE_STATS') return;

      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));

    init();
  }
}

UpdateHomepageStatsModalController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'API',
  'EventService',
  'ModalService',
];

export default UpdateHomepageStatsModalController;
