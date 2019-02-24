import Injectable from 'utils/injectable';
import Generator from 'utils/generator';

class RemoveModModalController extends Injectable {
  constructor(...injections) {
    super(RemoveModModalController.$inject, injections);

    this.errorMessage = '';
    this.requests = [];
    this.isLoading = true;

    const init = () => {
      // Get the list of requests
      this.BranchService.getSubbranchRequests(this.ModalService.inputArgs.branchid)
        .then(requests => {
          // get a specific branch object and insert into requests array on branch attribute
          const getBranch = request => this.BranchService
            .fetch(request.childid)
            .then(data => {
              request.branch = data;
            })
            .catch(() => {
              this.errorMessage = 'Unable to get branch!';
            });

          Generator.run(function* () { // eslint-disable-line func-names
            for (let i = 0; i < requests.length; i += 1) {
              yield getBranch(requests[i]);
            }

            this.$timeout(() => {
              this.requests = requests;
              this.isLoading = false;
            });
          }, this);
        })
        .catch(() => this.$timeout(() => {
          this.AlertsService.push('error', 'Unable to fetch child branch requests!');
          this.ModalService.Cancel();
        }));
    };

    const { events } = this.EventService;
    const listeners = [
      this.EventService.on(events.MODAL_CANCEL, name => this.handleModalCancel(name)),
      this.EventService.on(events.MODAL_OK, name => this.handleModalSubmit(name)),
    ];

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));

    init();
  }

  action(index, action) {
    this.isLoading = true;
    this.ModalService.disabled = true;

    this.BranchService.actionSubbranchRequest(
      action,
      this.requests[index].parentid,
      this.requests[index].childid,
    )
      .then(() => this.$timeout(() => {
        this.requests.splice(index, 1);
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.disabled = false;
      }))
      .catch(err => this.$timeout(() => {
        this.errorMessage = err.message;
        if (err.status === 404) {
          this.errorMessage = 'That user doesn\'t exist';
        }
        this.isLoading = false;
        this.ModalService.disabled = false;
      }));
  }

  handleModalCancel(name) {
    if (name !== 'REVIEW_SUBBRANCH_REQUESTS') return;

    this.$timeout(() => {
      this.errorMessage = '';
      this.isLoading = false;
      this.ModalService.Cancel();
    });
  }

  handleModalSubmit(name) {
    if (name !== 'REVIEW_SUBBRANCH_REQUESTS') return;

    this.$timeout(() => {
      this.errorMessage = '';
      this.isLoading = false;
      this.ModalService.disabled = false;
      this.ModalService.OK();
    });
  }
}

RemoveModModalController.$inject = [
  '$scope',
  '$timeout',
  'BranchService',
  'EventService',
  'ModalService',
];

export default RemoveModModalController;
