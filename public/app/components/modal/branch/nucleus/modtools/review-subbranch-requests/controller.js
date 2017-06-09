import Injectable from 'utils/injectable.js';
import Generator from 'utils/generator.js';

class RemoveModModalController extends Injectable {
  constructor(...injections) {
    super(RemoveModModalController.$inject, injections);

    this.errorMessage = '';
    this.requests = [];
    this.isLoading = true;

    let init = () => {
      // Get the list of requests
      this.BranchService.getSubbranchRequests(this.ModalService.inputArgs.branchid).then((requests) => {
        // get a specific branch object and insert into requests array on branch attribute
        let getBranch = (request) => {
          return this.BranchService.fetch(request.childid)
            .then((data) => {
              request.branch = data;
            }).catch(() => {
              this.errorMessage = 'Unable to get branch!';
            });
        };

        Generator.run(function* () {
          for(let i = 0; i < requests.length; i++) {
            yield getBranch(requests[i]);
          }

          this.$timeout(() => {
            this.requests = requests;
            this.isLoading = false;
          });
        }, this);
      }).catch(() => {
        this.$timeout(() => {
          this.AlertsService.push('error', 'Unable to fetch child branch requests!');
          this.ModalService.Cancel();
        });
      });
    };

    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'REVIEW_SUBBRANCH_REQUESTS') return;
      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.OK();
      });
    });

    this.EventService.on(this.EventService.events.MODAL_CANCEL, (name) => {
      if(name !== 'REVIEW_SUBBRANCH_REQUESTS') return;
      this.$timeout(() => {
        this.errorMessage = '';
        this.isLoading = false;
        this.ModalService.Cancel();
      });
    });

    init();
  }

  action(index, action) {
    this.isLoading = true;

    this.BranchService.actionSubbranchRequest(
      action,
      this.requests[index].parentid,
      this.requests[index].childid
    ).then(() => {
      this.$timeout(() => {
        this.requests.splice(index, 1);
        this.errorMessage = '';
        this.isLoading = false;
      });
    }).catch((response) => {
      this.$timeout(() => {
        this.errorMessage = response.message;
        if(response.status === 404) {
          this.errorMessage = 'That user doesn\'t exist';
        }
        this.isLoading = false;
      });
    });
  }
}

RemoveModModalController.$inject = ['$timeout', 'BranchService', 'EventService', 'ModalService'];

export default RemoveModModalController;
