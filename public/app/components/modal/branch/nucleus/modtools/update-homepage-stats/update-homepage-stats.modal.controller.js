import Injectable from 'utils/injectable.js';
import Generator from 'utils/generator.js';

class UpdateHomepageStatsModalController extends Injectable {
  constructor(...injections) {
    super(UpdateHomepageStatsModalController.$inject, injections);

    this.errorMessage = '';
    this.isLoading = true;
    this.stats = {
      donation_total: 0,
      raised_total: 0
    };

    let init = () => {
      Generator.run(function* () {
        try {
          let response = yield this.API.fetch('/constant/donation_total', {});
          this.stats.donation_total = response.data.data;

          response = yield this.API.fetch('/constant/raised_total', {});
          this.stats.raised_total = response.data.data;
        } catch(err) {
          this.AlertsService.push('error', 'Error updating homepage stats.');
          this.ModalService.Cancel();
        }

        this.$timeout(() => { this.isLoading = false; });
      }, this);
    };

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'UPDATE_HOMEPAGE_STATS') return;

      // validate stats
      this.isLoading = true;
      if(isNaN(this.stats.donation_total) || isNaN(this.stats.raised_total)) {
        return this.$timeout(() => {
          this.errorMessage = 'Invalid amount';
          this.isLoading = false;
        });
      }

      // update stats
      Generator.run(function* () {
        try {
          yield this.API.update('/constant/donation_total', {}, {
            data: Number(this.stats.donation_total)
          });

          yield this.API.update('/constant/raised_total', {}, {
            data: Number(this.stats.raised_total)
          });

          this.$timeout(() => {
            this.isLoading = false;
            this.ModalService.OK();
          });
        } catch(err) {
          this.AlertsService.push('error', 'Error updating homepage stats.');
          this.ModalService.Cancel();
        }
      }, this);
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'UPDATE_HOMEPAGE_STATS') return;

      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });

    init();
  }
}

UpdateHomepageStatsModalController.$inject = ['$timeout', 'API', 'EventService', 'ModalService', 'AlertsService'];

export default UpdateHomepageStatsModalController;
