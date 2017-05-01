import Injectable from 'utils/injectable';

class BranchPostVoteController extends Injectable {
  constructor(...injections) {
    super(BranchPostVoteController.$inject, injections);

    this.answers = [];
    this.selectedAnswerIndex = -1;
    this.controls = {
      sortBy: {
        items: ['DATE POSTED', 'VOTES'],
        selectedIndex: 0
      }
    };

    this.$scope.$watch(() => this.controls.sortBy.selectedIndex, () => { this.getPollAnswers(); });
  }

  vote() {
    let answer = this.answers[this.selectedAnswerIndex];
    if(!answer) return;
    this.PostService.votePollAnswer(answer.postid, answer.id).then(() => {
      this.AlertsService.push('success', 'Your vote has been cast!');
    }).catch((err) => {
      if(err.message) {
        this.AlertsService.push('error', err.message);
      } else {
        this.AlertsService.push('error', 'Error casting your vote!');
      }
    });
  }

  selectAnswer(index) {
    this.selectedAnswerIndex = index;
  }

  getPollAnswers(lastAnswerId) {
    this.selectedAnswerIndex = -1;
    let sortBy;
    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex]) {
      case 'DATE':
        sortBy = 'date';
        break;
      case 'VOTES':
        sortBy = 'votes';
        break;
      default:
        sortBy = 'date';
        break;
    }

    // fetch the poll answers
    this.PostService.getPollAnswers(this.PostService.post.id, sortBy, lastAnswerId).then((answers) => {
      this.$timeout(() => {
        // if lastAnswerId was specified we are fetching _more_ answers, so append them
        if(lastAnswerId) {
          this.answers = this.answers.concat(answers);
        } else {
          this.answers = answers;
        }
      });
    }).catch((err) => {
      if(err.status !== 404) {
        this.AlertsService.push('error', 'Error fetching poll answers.');
      }
    });
  }

  canSubmitNewAnswer() {
    if(this.PostService.post.locked) {
      if(this.PostService.post.data.creator === this.UserService.user.username) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  openSubmitPollAnswerModal() {
    this.ModalService.open(
      'SUBMIT_POLL_ANSWER',
      {
        postid: this.PostService.post.id
      },
      'Answer submitted.',
      'Unable to submit answer.'
    );
    this.EventService.on(this.EventService.events.MODAL_OK, (name) => {
      if(name !== 'SUBMIT_POLL_ANSWER') return;
      this.$state.go('weco.branch.post.vote', { reload: true });
    });
  }
}
BranchPostVoteController.$inject = ['$timeout', '$scope', '$state', 'PostService', 'AlertsService', 'ModalService', 'EventService', 'UserService'];

export default BranchPostVoteController;
