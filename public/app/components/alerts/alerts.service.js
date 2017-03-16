import Injectable from 'utils/injectable';

class AlertsService extends Injectable {
  constructor(...injections) {
    super(AlertsService.$inject, injections);

    this.queue = [];
    this.duration = 5000;
  }

  purge() {
    this.queue = this.queue.filter(function(alert) {
      return alert.alive === true;
    });
  }

  close(idx) {
    this.queue[idx].alive = false;
    this.$timeout(() => { this.purge(); }, 600);
  }

  push(type, text, persist) {
    let alert = {
      type: type,
      text: text,
      alive: true
    };
    this.$timeout(() => {
      this.queue = [alert].concat(this.queue);
      if(!persist) {
        this.$timeout(() => { this.close(alert); }, this.duration);
      }
    });
  }
}
AlertsService.$inject = ['$timeout'];

export default AlertsService;
