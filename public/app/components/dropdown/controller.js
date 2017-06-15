import Injectable from 'utils/injectable';

class DropdownController extends Injectable {
  constructor (...injections) {
    super(DropdownController.$inject, injections);

    this.listNodeCopy = null;
  }

  close () {
    if (this.listNodeCopy) {
      this.listNodeCopy.remove();
      this.listNodeCopy = null;
    }
  }

  open () {
    this.close();

    const list = this.$element[0].getElementsByTagName('ul')[0];
    this.listNodeCopy = list.cloneNode();
    this.listNodeCopy.classList.add('visible');

    let div = document.createElement('div');
    div.innerHTML = `<li
      class="dropdown--list-item text--uppercase"
      ng-class="{ 'selected': item === Dropdown.items[Dropdown.selected] }"
      ng-click="Dropdown.select($index)"
      ng-repeat="item in Dropdown.items">
      {{ item }}
    </li>`;

    for (let i = 0; i < div.childNodes.length; i++) {
      this.listNodeCopy.append(div.childNodes[i]);
    }

    const rect = list.getBoundingClientRect();
    this.listNodeCopy.style.left = `${rect.left}px`;
    this.listNodeCopy.style.top = `${rect.top}px`;
    
    this.$compile(this.listNodeCopy)(this.$scope);
    document.body.appendChild(this.listNodeCopy);

    // todo get the innerHTML string from the template directly
    // todo what happens on screen resize?
  }

  select (index) {
    this.$timeout(_ => {
      this.selected = index;
      this.close();
    });
  }
}

DropdownController.$inject = [
  '$compile',
  '$element',
  '$scope',
	'$timeout'
];

export default DropdownController;
