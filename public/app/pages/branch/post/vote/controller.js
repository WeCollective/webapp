import Injectable from 'utils/injectable';

class BranchPostVoteController extends Injectable {
  constructor(...injections) {
    super(BranchPostVoteController.$inject, injections);

    let cache = this.LocalStorageService.getObject('cache').postPoll || {};
    cache = cache[this.PostService.post.id] || {};

    this.answers = cache.answers || [];
    this.controls = {
      sortBy: {
        items: [
          'date posted',
          'votes'
        ],
        selectedIndex: 0
      }
    };
    this.selectedAnswerIndex = -1;

    // Get the initial state.
    this.getPollAnswers();

    let listeners = [];

    listeners.push(this.$scope.$watch(() => this.controls.sortBy.selectedIndex, (newValue, oldValue) => {
      if (newValue !== oldValue) this.getPollAnswers();
    }));

    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  canSubmitNewAnswer() {
    const post = this.PostService.post;
    const user = this.UserService.user;
    return !(post.locked && post.data.creator !== user.username);
  }

  getPollAnswers(lastAnswerId) {
    this.selectedAnswerIndex = -1;

    let sortBy;

    switch(this.controls.sortBy.items[this.controls.sortBy.selectedIndex].toLowerCase()) {
      case 'date':
        sortBy = 'date';
        break;

      case 'votes':
        sortBy = 'votes';
        break;

      default:
        sortBy = 'date';
        break;
    }

    // fetch the poll answers
    this.PostService.getPollAnswers(this.PostService.post.id, sortBy, lastAnswerId)
      // if lastAnswerId was specified we are fetching _more_ answers, so append them
      .then(answers => this.$timeout(() => {
        this.answers = lastAnswerId ? this.answers.concat(answers) : answers;

        const cache = this.LocalStorageService.getObject('cache');
        cache.postPoll = cache.postPoll || {};
        cache.postPoll[this.PostService.post.id] = cache.postPoll[this.PostService.post.id] || {};
        cache.postPoll[this.PostService.post.id].answers = this.answers;
        this.LocalStorageService.setObject('cache', cache);
      }))
      .catch(err => {
        if (err.status !== 404) {
          this.AlertsService.push('error', 'Error fetching poll answers.');
        }
      });
  }

  openSubmitPollAnswerModal() {
    this.ModalService.open('SUBMIT_POLL_ANSWER', { postid: this.PostService.post.id },
      'Answer submitted.', 'Unable to submit answer.');

    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if ('SUBMIT_POLL_ANSWER' !== name) return;
      this.$state.go('weco.branch.post.vote', { reload: true });
    });
  }

  selectAnswer(index) {
    this.selectedAnswerIndex = this.selectedAnswerIndex !== index ? index : -1;
  }

  vote() {
    const answer = this.answers[this.selectedAnswerIndex];
    
    if (!answer) return;
    
    this.PostService.votePollAnswer(answer.postid, answer.id)
      .then(() => this.AlertsService.push('success', 'Your vote has been cast!'))
      .catch(err => this.AlertsService.push('error', err.message || 'Error casting your vote!'));
  }
}

BranchPostVoteController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'AlertsService',
  'EventService',
  'LocalStorageService',
  'ModalService',
  'PostService',
  'UserService'
];

export default BranchPostVoteController;
