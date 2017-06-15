import Injectable from 'utils/injectable';

class DropdownController extends Injectable {
  constructor (...injections) {
    super(DropdownController.$inject, injections);

    this.isOpen = false;
  }

  close () {
    this.$timeout(_ => this.isOpen = false);
  }

  open () {
    this.$timeout(_ => this.isOpen = true);

    console.log(this);
  }

  select (index) {
    this.$timeout(_ => {
      this.selected = index;
      this.close();
    });
  }
}

DropdownController.$inject = [
	'$timeout'
];

export default DropdownController;
