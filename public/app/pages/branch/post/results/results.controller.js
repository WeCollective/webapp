import Injectable from 'utils/injectable';

class BranchPostResultsController extends Injectable {
  constructor(...injections) {
    super(BranchPostResultsController.$inject, injections);

    this.answers = [];
    this.chart = {
      type: 'pie',
      data: [],
      labels: [],
      options: {}
    };

    this.getPollAnswers();
    this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS, () => {
      this.getPollAnswers();
    });
  }

  // indicate whether the poll has been voted yet ie. do we have results to show
  hasSomeVotes() {
    let hasVotes = false;
    for(let datum of this.chart.data) {
      if(datum !== 0) hasVotes = true;
    }
    return hasVotes;
  }

  getPollAnswers(lastAnswerId) {
    // fetch the poll answers
    this.PostService.getPollAnswers(this.PostService.post.id, 'votes', undefined).then((answers) => {
      this.$timeout(() => {
        this.answers = answers;
        this.chart.labels = [];
        this.chart.data = [];
        for(let index in answers) {
          this.chart.labels.push(Number(index) + 1);
          this.chart.data.push(answers[index].votes);
        }
      });
    }).catch((err) => {
      if(err.status !== 404) {
        this.AlertsService.push('error', 'Error fetching poll answers.');
      }
    });
  }

  getAnswerColor(index) {
    if(index > this.ChartColours.length) return '#d3d3d3';
    return this.ChartColours[index];
  }
}
BranchPostResultsController.$inject = ['$timeout', '$scope', 'PostService', 'AlertsService', 'EventService', 'ChartColours'];

export default BranchPostResultsController;
