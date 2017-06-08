import Injectable from 'utils/injectable';

class HomeController extends Injectable {
  constructor (...injections) {
    super(HomeController.$inject, injections);

    this.stats = {
      branch_count: '...',
      donation_total: '...',
      raised_total: '...',
      user_count: '...'
    };

    for (let stat of Object.keys(this.stats)) {
      this.API.fetch('/constant/:stat', { stat })
        .then( res => this.stats[stat] = res.data.data )
        .catch( _ => this.AlertsService.push('error', 'Having trouble connecting...') )
        .then(this.$timeout);
    }
  }

  getHomepageImageURL() {
    if ('production' === this.ENV.name) {
      return 'https://s3-eu-west-1.amazonaws.com/weco-public-assets/homepage-image.jpg';
    }
    
    return 'https://s3-eu-west-1.amazonaws.com/dev-weco-public-assets/homepage-image.jpg';
  }
}

HomeController.$inject = [
  '$timeout',
  'AlertsService',
  'API',
  'ENV'
];

export default HomeController;