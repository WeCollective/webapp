import Injectable from 'utils/injectable';

class AlertsService extends Injectable {
  constructor(...injections) {
    super(AlertsService.$inject, injections);

    this.duration = 5000;
    this.queue = [];
  }

  close(idx) {
    if (this.queue[idx]) {
      this.queue[idx].alive = false;
    }

    this.$timeout(() => {
      this.purge();
    }, 600);
  }

  purge() {
    this.queue = this.queue.filter(alert => alert.alive === true);
  }

  push(type, text, persist) {
    const alert = {
      alive: true,
      text,
      type,
    };

    this.$timeout(() => {
      this.queue = [alert].concat(this.queue);

      if (!persist) {
        this.$timeout(() => this.close(0), this.duration);
      }
    });
  }
}

AlertsService.$inject = [
  '$timeout',
];

export default AlertsService;
