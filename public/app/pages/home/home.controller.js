import Injectable from 'injectable';

class HomeController extends Injectable {
  constructor(...injections) {
    super(HomeController.$inject, injections);

    this.stats = {
      donation_total: '...',
      raised_total: '...',
      user_count: '...',
      branch_count: '...'
    };
  }
  getHomepageImageURL() {
    if(this.ENV.name === 'production') {
      return 'https://s3-eu-west-1.amazonaws.com/weco-public-assets/homepage-image.jpg';
    } else {
      return 'https://s3-eu-west-1.amazonaws.com/dev-weco-public-assets/homepage-image.jpg';
    }
  }
}
HomeController.$inject = ['$http', 'ENV', '$timeout'];

export default HomeController;
