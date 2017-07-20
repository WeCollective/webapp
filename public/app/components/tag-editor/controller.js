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

    if (this.items.includes(this.tag)) return;

    this.items.push(this.tag);
    this.tag = '';
  }

  handleInputChange() {
    const length = this.tag.length;

    // Do not allow spaces in the tags.
    this.tag = this.tag.split(' ').join('');

    if (this.tag[length - 1] === ',') {
      this.tag = this.tag.substring(0, length - 1);
      this.addTag();
    }
  }

  removeTag(tag) {
    const tagIndex = this.items.indexOf(tag);

    if (tagIndex !== -1) {
      this.items.splice(tagIndex, 1);
    }

    this.errorMessage = '';
  }
}

TagEditorController.$inject = [];

export default TagEditorController;
