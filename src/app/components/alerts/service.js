import Injectable from 'utils/injectable';

class AlertsService extends Injectable {
  constructor(...injections) {
    super(AlertsService.$inject, injections);

    this.counter = 0;
    this.duration = 5000;
    this.queue = [];
  }

  close(id) {
    const transitionFromStylesheet = 300;

    for (let i = this.queue.length - 1; i >= 0; i -= 1) {
      const alert = this.queue[i];
      if (alert && alert.id === id) {
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
    this.counter += 1;

    const id = this.counter;
    const alert = {
      alive: true,
      id,
      persist: !!persist,
      text,
      type,
    };

    this.$timeout(() => {
      this.queue = [
        alert,
        ...this.queue,
      ];

      if (!alert.persist) {
        this.$timeout(() => this.close(id), this.duration);
      }
    });
  }
}

AlertsService.$inject = [
  '$timeout',
];

export default AlertsService;
