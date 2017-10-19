import Injectable from 'utils/injectable';

class AlertsService extends Injectable {
  constructor(...injections) {
    super(AlertsService.$inject, injections);

    this.duration = 5000;
    this.queue = [];
  }

  close() {
    const transitionFromStylesheet = 300;

    for (let i = this.queue.length - 1; i >= 0; i -= 1) {
      const alert = this.queue[i];
      if (alert && alert.alive && !alert.persist) {
        this.queue[i].alive = false;
        break;
      }
    }

    this.$timeout(() => {
      this.purge();
    }, transitionFromStylesheet);
  }

  purge() {
    this.queue = this.queue.filter(alert => alert.alive === true);
  }

  push(type, text, persist) {
    const alert = {
      alive: true,
      persist: !!persist,
      text,
      type,
    };

    this.$timeout(() => {
      this.queue = [alert].concat(this.queue);

      if (!alert.persist) {
        this.$timeout(() => this.close(), this.duration);
      }
    });
  }
}

AlertsService.$inject = [
  '$timeout',
];

export default AlertsService;
