import Injectable from 'utils/injectable.js';

class RemoveModModalController extends Injectable {
  constructor(...injections) {
    super(RemoveModModalController.$inject, injections);

    this.errorMessage = '';
    this.requests = [];
    this.isLoading = true;

    // Get the list of requests
    this.BranchService.getSubbranchRequests(this.ModalService.inputArgs.branchid).then((requests) => {
      // get a specific branch object and insert into requests array on branch attribute
      let getBranch = (branchid, index) => {
        return this.BranchService.fetch(branchid)
          .then((data) => {
            requests[index].branch = data;
          }).catch(() => {
            this.errorMessage = 'Unable to get branch!';
          });
      };

      // populate requests array with full branch data based on the childids
      let promises = [];
      for(var i = 0; i < requests.length; i++) {
        promises.push(getBranch(requests[i].childid, i));
      }

      // when all branches fetched, loading finished
      Promise.all(promises).then(() => {
        this.$timeout(() => {
          this.requests = requests;
          this.isLoading = false;
        });
      }).catch(() => {
        this.$timeout(() => {
          this.errorMessage = 'Unable to fetch child branch requests!';
          this.isLoading = false;
        });
      });
    }).catch(() => {
      this.$timeout(() => {
        this.errorMessage = 'Unable to fetch child branch requests!';
      });
    });

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
