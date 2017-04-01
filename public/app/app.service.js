import Injectable from 'utils/injectable';

class AppService extends Injectable {
  constructor(...injections) {
    super(AppService.$inject, injections);
    this.frameColumnOpen = false;
  }

  toggleOpenFrameColumn() { this.frameColumnOpen = !this.frameColumnOpen; }
}
AppService.$inject = [];

export default AppService;
