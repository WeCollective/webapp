import Injectable from 'utils/injectable';

class Header extends Injectable {
  constructor(...injections) {
    super(Header.$inject, injections);
    this.filters = {};
  }

  getFilters() {
    return this.filters;
  }

  setFilters(filters) {
    this.filters = filters;
    this.EventService.emit(this.EventService.events.CHANGE_FILTER);
  }
}

Header.$inject = [
  'EventService',
];

export default Header;
