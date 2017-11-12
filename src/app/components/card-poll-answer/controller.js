import Injectable from 'utils/injectable';

class CardPollAnswerController extends Injectable {
  constructor(...injections) {
    super(CardPollAnswerController.$inject, injections);
  }

  getAnswerColor(index) {
    return this.ChartColours[index] || this.ChartColours[this.ChartColours.length - 1];
  }

  getThumbnail() {
    // const IMG_DIR = '/assets/placeholders/';
    // return this.post.profileUrlThumb || `${IMG_DIR}post--${this.post.type}.jpg`;
  }
}

CardPollAnswerController.$inject = [
  'ChartColours',
];

export default CardPollAnswerController;
