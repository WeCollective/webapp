import Injectable from 'utils/injectable';

class Tooltip extends Injectable {
  constructor(...injections) {
    super(Tooltip.$inject, injections);

    this.restrict = 'A';
    this.replace = true;
    this.scope = {
      text: '&',
      offsetX: '&',
      offsetY: '&'
    };
  }
  link(scope, element) {
    let el = element[0];
    let offsetX = scope.offsetX(), offsetY = scope.offsetY();
    if(!offsetX || isNaN(offsetX)) offsetX = 0;
    if(!offsetY || isNaN(offsetY)) offsetY = 0;

    el.addEventListener('mouseover', () => {
      this.$timeout(() => {
        this.TooltipService.visible = true;
        this.TooltipService.text = scope.text();
        this.TooltipService.x = el.getBoundingClientRect().left + this.$window.pageXOffset + offsetX;
        this.TooltipService.y = el.getBoundingClientRect().top + this.$window.pageYOffset + offsetY;

        this.$timeout(() => { this.TooltipService.visible = false; }, 10000);
      });
    }, false);

    el.addEventListener('mouseout', () => {
      this.$timeout(() => { this.TooltipService.visible = false; });
    });
    el.addEventListener('click', () => {
      this.$timeout(() => { this.TooltipService.visible = false; });
    });

    scope.TooltipService = this.TooltipService;
  }
}
Tooltip.$inject = ['$timeout', '$window', 'TooltipService'];

export default Tooltip;
