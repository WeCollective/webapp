import Injectable from 'utils/injectable';

class HomeController extends Injectable {
  constructor(...injections) {
    super(HomeController.$inject, injections);

    this.stats = {
      donation_total: '...',
      raised_total: '...',
      user_count: '...',
      branch_count: '...'
    };

    for(let stat of Object.keys(this.stats)) {
      console.log(stat);
      this.API.fetch('/constant/:stat', {
        stat: stat
      }).then((response) => {
        this.stats[stat] = response.data.data;
      }).catch((err) => {
        this.AlertsService.push('error', 'Having trouble connecting...');
      }).then(this.$timeout);
    }
  }
  getHomepageImageURL() {
    if(this.ENV.name === 'production') {
      return 'https://s3-eu-west-1.amazonaws.com/weco-public-assets/homepage-image.jpg';
    } else {
      return 'https://s3-eu-west-1.amazonaws.com/dev-weco-public-assets/homepage-image.jpg';
    }
  }
}
HomeController.$inject = ['API', 'ENV', '$timeout', 'AlertsService'];

export default HomeController;
