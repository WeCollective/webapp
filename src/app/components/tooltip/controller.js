import Injectable from 'utils/injectable';

class TooltipController extends Injectable {
  constructor(...injections) {
    super(TooltipController.$inject, injections);

    const listeners = [
      this.EventService.on('$stateChangeSuccess', () => this.$timeout(() => {
        this.TooltipService.visible = false;
      })),
    ];
    this.$scope.$on('$destroy', () => listeners.forEach(deregisterListener => deregisterListener()));
  }
}

TooltipController.$inject = [
  '$scope',
  '$timeout',
  'EventService',
  'TooltipService',
];

export default TooltipController;
