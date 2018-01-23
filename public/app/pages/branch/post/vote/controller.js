import Constants from 'config/constants';
import Injectable from 'utils/injectable';

const { SortVotes } = Constants.Filters;

class BranchPostVoteController extends Injectable {
  constructor(...injections) {
    super(BranchPostVoteController.$inject, injections);

    this.callbackDropdown = this.callbackDropdown.bind(this);
    this.setDefaultControls = this.setDefaultControls.bind(this);

    let cache = this.LocalStorageService.getObject('cache').postPoll || {};
    cache = cache[this.PostService.post.id] || {};
    this.items = cache.answers || [];
    this.selectedAnswerIndex = -1;

    this.controls = {
      sortBy: {
        items: SortVotes,
        selectedIndex: -1,
        title: 'sorted by',
      },
    };
    this.$timeout(() => this.setDefaultControls());

    const ctrls = this.controls;
    const {
      attachFilterListeners,
      getFilterFlatItems,
    } = this.UrlService;

    this.sortBy = getFilterFlatItems(ctrls.sortBy);

    const listeners = [...attachFilterListeners(this.$scope, ctrls, this.callbackDropdown)];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }

  callbackDropdown() {
    this.getItems();
  }

  canSubmitNewAnswer() {
    const {
      post,
      user,
    } = this.PostService;
    return !(post.locked && post.data.creator !== user.username);
  }

  getItems(lastAnswerId) {
    this.selectedAnswerIndex = -1;
    const sortBy = this.getSortBy();

    // fetch the poll answers
    this.PostService.getPollAnswers(this.PostService.post.id, sortBy, lastAnswerId)
      // if lastAnswerId was specified we are fetching _more_ answers, so append them
      .then(answers => this.$timeout(() => {
        this.items = lastAnswerId ? this.items.concat(answers) : answers;

        const cache = this.LocalStorageService.getObject('cache');
        cache.postPoll = cache.postPoll || {};
        cache.postPoll[this.PostService.post.id] = cache.postPoll[this.PostService.post.id] || {};
        cache.postPoll[this.PostService.post.id].answers = this.items;
        this.LocalStorageService.setObject('cache', cache);
      }))
      .catch(err => {
        if (err.status !== 404) {
          this.AlertsService.push('error', 'Error fetching poll answers.');
        }
      });
  }

  getSortBy() {
    return this.UrlService.getFilterItemParam(this.controls.sortBy, 'sort-vote');
  }

  openSubmitPollAnswerModal() {
    this.ModalService.open(
      'SUBMIT_POLL_ANSWER',
      { postid: this.PostService.post.id },
      'Answer submitted.',
      'Unable to submit answer.',
    );

    this.EventService.on(this.EventService.events.MODAL_OK, name => {
      if (name !== 'SUBMIT_POLL_ANSWER') return;
      this.$state.go('weco.branch.post.vote', { reload: true });
    });
  }

  selectAnswer(index) {
    this.selectedAnswerIndex = this.selectedAnswerIndex !== index ? index : -1;
  }

  setDefaultControls() {
    const { sortBy } = this.controls;
    const {
      getUrlSearchParams,
      urlToFilterItemIndex,
    } = this.UrlService;
    const { sort } = getUrlSearchParams();
    const defaultSortByIndex = 0;
    const urlIndexSortBy = urlToFilterItemIndex(sort, sortBy);

    sortBy.selectedIndex = urlIndexSortBy !== -1 ? urlIndexSortBy : defaultSortByIndex;

    // Set filters through service for other modules.
    setTimeout(() => {
      this.callbackDropdown();
    }, 0);
  }

  vote() {
    const answer = this.items[this.selectedAnswerIndex];

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
  'UrlService',
];

export default BranchPostVoteController;
