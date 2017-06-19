import Injectable from 'utils/injectable';

class DropdownController extends Injectable {
  constructor (...injections) {
    super(DropdownController.$inject, injections);

    this.handleClick = this.handleClick.bind(this);

    this.hasListener = false;
    this.listNodeCopy = null;
  }

  close () {
    if (this.listNodeCopy) {
      this.listNodeCopy.remove();
      this.listNodeCopy = null;
    }
  }

  handleClick () {
    this.close();
    document.removeEventListener('click', this.handleClick);
    this.hasListener = false;
  }

  open () {
    this.close();

    const list = this.$element[0].getElementsByTagName('ul')[0];
    this.listNodeCopy = list.cloneNode();
    this.listNodeCopy.classList.add('visible');

    let div = document.createElement('div');
    div.innerHTML = this.$templateCache.get('/app/components/dropdown/view.html');

    const divList = div.getElementsByTagName('ul')[0];
    for (let i = 0; i < divList.children.length; i++) {
      this.listNodeCopy.append(divList.children[i]);
    }

    const rect = list.getBoundingClientRect();
    this.listNodeCopy.style.left = `${rect.left}px`;
    this.listNodeCopy.style.top = `${rect.top}px`;

    this.$compile(this.listNodeCopy)(this.$scope);
    document.body.appendChild(this.listNodeCopy);

    setTimeout(_ => {
      if (!this.hasListener) {
        this.hasListener = true;
        document.addEventListener('click', this.handleClick);
      }
    }, 0);
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
  '$templateCache',
	'$timeout'
];

export default DropdownController;
