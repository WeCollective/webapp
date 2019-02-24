import Injectable from 'utils/injectable';

class TooltipComponent extends Injectable {
  constructor(...injections) {
    super(TooltipComponent.$inject, injections);
    this.handleClick = this.handleClick.bind(this);
    this.hide = this.hide.bind(this);

    this.controller = 'TooltipController';
    this.controllerAs = 'Tooltip';
    this.restrict = 'A';
    this.replace = true;
    this.scope = {
      offsetX: '&',
      offsetY: '&',
      text: '&',
    };
  }

  handleClick() {
    this.$timeout(this.hide);
  }

  hide(delay = 0) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
    }

    this.timer = this.$timeout(() => this.TooltipService.visible = false, delay);
  }

  link(scope, element) {
    // Disable on touch devices without mouse.
    if (!this.AppService.hasMouse && this.AppService.hasTouch()) return;

    let tooltip = null;
    const { hide } = this;

    const el = element[0];
    let rect = el.getBoundingClientRect();

    let offsetX = scope.offsetX();
    let offsetY = scope.offsetY();
    if (!offsetX || Number.isNaN(offsetX)) offsetX = 0;
    if (!offsetY || Number.isNaN(offsetY)) offsetY = 0;

    document.addEventListener('click', this.handleClick);

    const handleTooltipMouseOut = function (event) { // eslint-disable-line func-names
      if (!tooltip) return;
      const target = event.toElement || event.relatedTarget;
      let parentNode = target;
      while (parentNode) {
        if (parentNode === this) return;
        ({ parentNode } = parentNode);
      }
      if (parentNode === this) return;
      tooltip.removeEventListener('mouseout', handleTooltipMouseOut, true);
      tooltip = null;
      hide();
    };

    const mouseOutHandler = event => {
      rect = el.getBoundingClientRect();

      // Do not hide the tooltip if we are still within the element.
      // This would happen when we mouse over the child element.
      if (event.clientX > rect.right || event.clientX < rect.left ||
        event.clientY < rect.top || event.clientY > rect.bottom) {
        this.$timeout(hide);
      }
    };

    const mouseOverHandler = () => this.$timeout(() => {
      if (scope.text() === '') return;

      rect = el.getBoundingClientRect();

      this.TooltipService.text = scope.text();
      this.TooltipService.visible = true;
      this.TooltipService.x = rect.left + this.$window.pageXOffset + offsetX;
      this.TooltipService.y = rect.top + this.$window.pageYOffset + offsetY;

      [tooltip] = document.getElementsByClassName('tooltip');
      if (!tooltip) return;
      tooltip.addEventListener('mouseout', handleTooltipMouseOut, true);
    });

    el.addEventListener('mouseover', mouseOverHandler, false);
    el.addEventListener('mouseout', mouseOutHandler, false);

    element.on('$destroy', () => {
      el.removeEventListener('mouseover', mouseOverHandler, false);
      el.removeEventListener('mouseout', mouseOutHandler, false);
      document.removeEventListener('click', this.handleClick);
    });

    scope.TooltipService = this.TooltipService;
  }
}

TooltipComponent.$inject = [
  '$timeout',
  '$window',
  'AppService',
  'EventService',
  'TooltipService',
];

export default TooltipComponent;
