import Injectable from 'utils/injectable';

class BranchPostResultsController extends Injectable {
  constructor (...injections) {
    super(BranchPostResultsController.$inject, injections);

    this.answers = [];
    this.chart = {
      data: [],
      labels: [],
      options: {},
      type: 'pie'
    };

    this.getPollAnswers();

    let listeners = [];
    
    listeners.push(this.EventService.on(this.EventService.events.STATE_CHANGE_SUCCESS,_ => this.getPollAnswers()));

    this.$scope.$on('$destroy', _ => listeners.forEach(deregisterListener => deregisterListener()));
  }

  getAnswerColor (index) {
    return index > this.ChartColours.length - 1 ? '#d3d3d3' : this.ChartColours[index];
  }

  // Params: lastAnswerId
  getPollAnswers () {
    this.PostService.getPollAnswers(this.PostService.post.id, 'votes', undefined)
      .then(answers => this.$timeout(_ => {
        this.answers = answers;
        this.chart.labels = [];
        this.chart.data = [];
        
        for (let index in answers) {
          this.chart.labels.push(Number(index) + 1);
          this.chart.data.push(answers[index].votes);
        }
      }))
      .catch(err => {
        if (err.status !== 404) {
          this.AlertsService.push('error', 'Error fetching poll answers.');
        }
      });
  }

  // indicate whether the poll has been voted yet ie. do we have results to show
  hasSomeVotes () {
    for (let datum of this.chart.data) {
      if (datum !== 0) return true;
    }
    return false;
  }
}

BranchPostResultsController.$inject = [
  '$scope',
  '$timeout',
  'AlertsService',
  'ChartColours',
  'EventService',
  'PostService'
];

export default BranchPostResultsController;
