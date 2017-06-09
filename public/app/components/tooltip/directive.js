import Injectable from 'utils/injectable';

class TooltipComponent extends Injectable {
  constructor (...injections) {
    super(TooltipComponent.$inject, injections);

    this.controller = 'TooltipController';
    this.controllerAs = 'Tooltip';
    this.restrict = 'A';
    this.replace = true;
    this.scope = {
      offsetX: '&',
      offsetY: '&',
      text: '&'
    };
  }

  hide (delay = 0) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
    }

    this.timer = this.$timeout(_ => this.TooltipService.visible = false, delay);
  }

  link (scope, element) {
    const el = element[0];
    let rect = el.getBoundingClientRect();
    
    let offsetX = scope.offsetX(),
      offsetY   = scope.offsetY();

    if (!offsetX || isNaN(offsetX)) {
      offsetX = 0;
    }

    if (!offsetY || isNaN(offsetY)) {
      offsetY = 0;
    }

    el.addEventListener('mouseover', _ => {
      this.$timeout(_ => {
        if (scope.text() === '') return;

        rect = el.getBoundingClientRect();

        this.TooltipService.text = scope.text();
        this.TooltipService.visible = true;
        this.TooltipService.x = rect.left + this.$window.pageXOffset + offsetX;
        this.TooltipService.y = rect.top + this.$window.pageYOffset + offsetY;
      });
    }, false);

    el.addEventListener('mouseout', event => {
      rect = el.getBoundingClientRect();

      // Do not hide the tooltip if we are still within the element.
      // This would happen when we mouse over the child element.
      if (event.clientX > rect.right || event.clientX < rect.left ||
        event.clientY < rect.top || event.clientY > rect.bottom) {
        this.$timeout(_ => this.hide());
      }
    });

    scope.TooltipService = this.TooltipService;
  }
}

TooltipComponent.$inject = [
  '$timeout',
  '$window',
  'EventService',
  'TooltipService'
];

export default TooltipComponent;
