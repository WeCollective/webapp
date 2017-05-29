import Injectable from 'utils/injectable';
import NotificationTypes from 'components/notification/notification-types.config';

class NotificationComponent extends Injectable {
  constructor (...injections) {
    super(NotificationComponent.$inject, injections);

    this.restrict = 'E';
    this.replace = true;
    this.scope = {
      notification: '='
    };
  }

  // Params: scope, element, attrs
  link (scope, element) {
    scope.UserService = this.UserService;
    scope.NotificationTypes = NotificationTypes;

    scope.reasonString = () => {
      switch(scope.notification.reason) {
        case 'branch_rules':
          return 'for violating the branch rules';

        case 'site_rules':
          return 'for violating the site rules';

        case 'wrong_type':
          return 'for being tagged with an incorrect post type';

        case 'nsfw':
          return 'as NSFW';

        default:
          return '';
      }
    };

    // remplate name is as represented in NotificationTypes with no caps and hyphens instead of underscores
    const templateName = ( () => {
      for (let key in NotificationTypes) {
        if (NotificationTypes[key] === scope.notification.type) {
          return key.toLowerCase().replace(new RegExp('_', 'g'), '-');
        }
      }
    })();

    this.$templateRequest(`/app/components/notification/${templateName}.template.html`)
      .then( template => {
        element.html(template);
        this.$compile(element.contents())(scope);
      }, () => {
        console.error('Unable to get notification template.');
      });
  }
}

NotificationComponent.$inject = [
  '$compile',
  '$templateRequest',
  '$timeout',
  'AlertsService',
  'UserService'
];

export default NotificationComponent;