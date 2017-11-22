import Injectable from 'utils/injectable';

class DateService extends Injectable {
  constructor(...injections) {
    super(DateService.$inject, injections);
  }

  getElapsedTime(timestamp) {
    // Cast all timestamps to 10-digit numbers.
    if (timestamp.toString().length === 13) {
      timestamp = Math.floor(timestamp / 1000);
    }

    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    const now = Math.floor(+new Date() / 1000);
    let diff = now - timestamp; // Difference in seconds.

    if (diff < 0) return 'invalid time';

    days = Math.floor(diff / 86400);
    diff -= days * 86400;

    hours = Math.floor(diff / 3600);
    diff -= hours * 3600;

    minutes = Math.floor(diff / 60);
    diff -= minutes * 60;

    seconds = diff;
    diff = 0;

    if (days > 1) {
      return this.$filter('date')(new Date(timestamp * 1000), 'dd MMM yyyy');
    }

    if (days === 1) {
      return 'yesterday';
    }

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
  }
}

DateService.$inject = [
  '$filter',
];

export default DateService;
