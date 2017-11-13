import Injectable from 'utils/injectable';

class TagEditorController extends Injectable {
  constructor(...injections) {
    super(TagEditorController.$inject, injections);

    this.errorMessage = '';
    this.tag = '';
  }

  addTag() {
    this.errorMessage = '';

    if (this.items.length >= this.max() || !this.tag) return;

    // Do not allow spaces in the tags.
    this.tag = this.tag.split(' ').join('').toLowerCase();

    if (this.getTagIndex(this.tag) !== -1) return;

    if (this.items.length === 0 || typeof this.items[0] === 'object') {
      this.items.push({
        isRemovable: true,
        label: this.tag,
      });
    }
    else {
      this.items.push(this.tag);
    }

    this.tag = '';
  }

  getTagIndex(tag) {
    if (this.items.length === 0) {
      return -1;
    }

    if (typeof this.items[0] === 'object') {
      for (let i = 0; i < this.items.length; i += 1) {
        const { label } = this.items[i];

        if ((typeof tag === 'object' && label === tag.label) || label === tag) {
          return i;
        }
      }

      return -1;
    }

    return this.items.indexOf(typeof tag === 'object' ? tag.label : tag);
  }

  handleInputChange() {
    const { length } = this.tag;

    // Do not allow spaces in the tags.
    this.tag = this.tag.split(' ').join('');

    if (this.tag[length - 1] === ',') {
      this.tag = this.tag.substring(0, length - 1);
      this.addTag();
    }
  }

  isRemovable(tag) {
    return typeof tag === 'object' ? tag.isRemovable : true;
  }

  renderTagLabel(tag) {
    return typeof tag === 'object' ? tag.label : tag;
  }

  removeTag(tag) {
    const tagIndex = this.getTagIndex(tag);

    if (tagIndex !== -1 && this.isRemovable(tag)) {
      this.items.splice(tagIndex, 1);
    }

    this.errorMessage = '';
  }
}

TagEditorController.$inject = [];

export default TagEditorController;
