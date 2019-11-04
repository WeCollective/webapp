import Injectable from 'utils/injectable';

class EmitOnScrollToBottomComponent extends Injectable {
    constructor(...injections) {
        super(EmitOnScrollToBottomComponent.$inject, injections);
        this.restrict = 'A';
    }

    link(scope, element) {
        this.$window.addEventListener('scroll', () => {
            if (this.$window.pageYOffset + document.body.offsetHeight >= document.body.scrollHeight) {
                const { events } = this.EventService;
                this.EventService.emit(events.SCROLLED_TO_BOTTOM);
            }
        });
        /*
        element.on('scroll', () => {
            const el = element[0];
            console.log("ISCROLLED");
            if (el.scrollTop + el.offsetHeight >= el.scrollHeight) {
                const { events } = this.EventService;
                this.EventService.emit(events.SCROLLED_TO_BOTTOM);
            }
        });
        */
    }
}

EmitOnScrollToBottomComponent.$inject = [
    '$window',
    '$timeout',
    'EventService',
];

export default EmitOnScrollToBottomComponent;