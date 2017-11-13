import Injectable from 'utils/injectable';

class TooltipController extends Injectable {
  constructor (...injections) {
    super(TooltipController.$inject, injections);

    this.EventService.on('$stateChangeSuccess', _ => this.$timeout(_ => this.TooltipService.visible = false));
  }
}

TooltipController.$inject = [
  '$state',
  '$timeout',
  'AppService',
  'EventService',
  'TooltipService'
];

export default TooltipController;
