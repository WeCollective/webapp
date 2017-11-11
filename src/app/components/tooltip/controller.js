import Injectable from 'utils/injectable';

class TooltipController extends Injectable {
  constructor(...injections) {
    super(TooltipController.$inject, injections);

    this.EventService.on('$stateChangeSuccess', () => this.$timeout(() => {
      this.TooltipService.visible = false;
    }));
  }
}

TooltipController.$inject = [
  '$state',
  '$timeout',
  'AppService',
  'EventService',
  'TooltipService',
];

export default TooltipController;
