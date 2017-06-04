// APP DEPENDENCIES
import angular from 'angular';
import UIRouter from 'angular-ui-router';
import ngAnimate from 'angular-animate';
import ngSanitize from 'angular-sanitize';
import ngFileUpload from 'ng-file-upload';
import ngMarked from 'angular-marked';
import ngGoogleAnalytics from 'angular-google-analytics';
import CacheFactory from 'angular-cache';

let app = angular.module(
  'wecoApp', [
    UIRouter,
    ngAnimate,
    ngSanitize,
    ngFileUpload,
    ngMarked,
    ngGoogleAnalytics,
    CacheFactory
  ]
);

// CONSTANTS
import ENV from 'env.config';
app.constant('ENV', ENV);

import NotificationTypes from 'components/notification/config';
app.constant('NotificationTypes', NotificationTypes);

app.constant('ChartColours', [
  '#9ac2e5',
  '#4684c1',
  '#96c483',
  '#389978',
  '#70cdd4',
  '#227692',
  '#7174ab',
  '#2c4a6e'
]);

// FILTERS
import AppFilters from 'app.filters';
app.filter('reverse', AppFilters.reverse);
app.filter('capitalize', AppFilters.capitalize);

// RUN
import AppRun from 'app.run';
app.run(AppRun);

// REGISTER COMPONENTS
import ComponentRegistrar from 'utils/component-registrar';
let registrar = new ComponentRegistrar('wecoApp');

// Config
import AppConfig from 'app.config';
import AppRoutes from 'app.routes';

registrar.config(AppConfig);
registrar.config(AppRoutes);



// SERVICES.
import AlertsService from 'components/alerts/alerts.service';
import API from 'services/api';
import AppService from 'app.service';
import BranchService from 'services/branch';
import CommentService from 'services/comment';
import EventService from 'services/event';
import ModService from 'services/mod';
import ModalService from 'components/modal/service';
import PostService from 'services/post';
import TooltipService from 'components/tooltip/service';
import UploadService from 'services/upload';
import UserService from 'services/user';
import WallService from 'pages/branch/service';

registrar.service('AlertsService', AlertsService);
registrar.service('API', API);
registrar.service('AppService', AppService);
registrar.service('BranchService', BranchService);
registrar.service('CommentService', CommentService);
registrar.service('EventService', EventService);
registrar.service('ModService', ModService);
registrar.service('ModalService', ModalService);
registrar.service('PostService', PostService);
registrar.service('TooltipService', TooltipService);
registrar.service('UploadService', UploadService);
registrar.service('UserService', UserService);
registrar.service('WallService', WallService);



// Controllers
import AppController from 'app.controller';
import BranchPostController from 'pages/branch/post/controller';
import BranchPostResultsController from 'pages/branch/post/results/controller';
import BranchPostVoteController from 'pages/branch/post/vote/controller';
import BranchWallController from 'pages/branch/wall/controller';
import ProfileNotificationsController from 'pages/profile/notifications/controller';
import TooltipController from 'components/tooltip/controller';

registrar.controller('AppController', AppController);
registrar.controller('BranchPostController', BranchPostController);
registrar.controller('BranchPostResultsController', BranchPostResultsController);
registrar.controller('BranchPostVoteController', BranchPostVoteController);
registrar.controller('BranchWallController', BranchWallController);
registrar.controller('ProfileNotificationsController', ProfileNotificationsController);
registrar.controller('TooltipController', TooltipController);

import HomeController from 'pages/home/home.controller';
registrar.controller('HomeController', HomeController);
import AuthController from 'pages/auth/auth.controller';
registrar.controller('AuthController', AuthController);
import VerifyController from 'pages/auth/verify/verify.controller';
registrar.controller('VerifyController', VerifyController);
import ResetPasswordController from 'pages/auth/reset-password/reset-password.controller';
registrar.controller('ResetPasswordController', ResetPasswordController);
import ProfileController from 'pages/profile/profile.controller';
registrar.controller('ProfileController', ProfileController);
import ProfileSettingsController from 'pages/profile/settings/settings.controller';
registrar.controller('ProfileSettingsController', ProfileSettingsController);
import BranchController from 'pages/branch/branch.controller';
registrar.controller('BranchController', BranchController);
import BranchNucleusController from 'pages/branch/nucleus/nucleus.controller';
registrar.controller('BranchNucleusController', BranchNucleusController);
import BranchNucleusAboutController from 'pages/branch/nucleus/about/about.controller';
registrar.controller('BranchNucleusAboutController', BranchNucleusAboutController);
import BranchNucleusModeratorsController from 'pages/branch/nucleus/moderators/moderators.controller';
registrar.controller('BranchNucleusModeratorsController', BranchNucleusModeratorsController);
import BranchNucleusSettingsController from 'pages/branch/nucleus/settings/settings.controller';
registrar.controller('BranchNucleusSettingsController', BranchNucleusSettingsController);
import BranchNucleusModtoolsController from 'pages/branch/nucleus/modtools/modtools.controller';
registrar.controller('BranchNucleusModtoolsController', BranchNucleusModtoolsController);
import BranchNucleusFlaggedPostsController from 'pages/branch/nucleus/flagged-posts/flagged-posts.controller';
registrar.controller('BranchNucleusFlaggedPostsController', BranchNucleusFlaggedPostsController);
import BranchSubbranchesController from 'pages/branch/subbranches/subbranches.controller';
registrar.controller('BranchSubbranchesController', BranchSubbranchesController);


// Components
import ListItemComponent from 'components/list-item/directive';
import ListItemController from 'components/list-item/controller';
import LoadingComponent from 'components/loading/directive';
import NavbarComponent from 'components/nav-bar/directive';
import NavbarController from 'components/nav-bar/controller';
import OnScrollToBottomComponent from 'components/on-scroll-to-bottom/directive';
import TooltipComponent from 'components/tooltip/directive';
import UploadImageModalController from 'components/modal/upload-image/controller';

registrar.directive('listItem', ListItemComponent);
registrar.controller('ListItemController', ListItemController);
registrar.directive('loading', LoadingComponent);
registrar.directive('navBar', NavbarComponent);
registrar.controller('NavbarController', NavbarController);
registrar.directive('onScrollToBottom', OnScrollToBottomComponent);
registrar.directive('tooltip', TooltipComponent);
registrar.controller('UploadImageModalController', UploadImageModalController);

import CoverPhotoComponent from 'components/cover-photo/cover-photo.directive';
import CoverPhotoController from 'components/cover-photo/cover-photo.controller';
registrar.directive('coverPhoto', CoverPhotoComponent);
registrar.controller('CoverPhotoController', CoverPhotoController);

import AlertsComponent from 'components/alerts/alerts.directive';
registrar.directive('alerts', AlertsComponent);

import TabsComponent from 'components/tabs/tabs.directive';
import TabsController from 'components/tabs/tabs.controller';
registrar.directive('tabs', TabsComponent);
registrar.controller('TabsController', TabsController);

import ModLogEntryComponent from 'components/mod-log-entry/mod-log-entry.directive';
registrar.directive('modLogEntry', ModLogEntryComponent);

import DropdownComponent from 'components/dropdown/dropdown.directive';
registrar.directive('dropdown', DropdownComponent);

import NotificationComponent from 'components/notification/notification-item.directive';
registrar.directive('notification', NotificationComponent);

import TagEditorComponent from 'components/tag-editor/tag-editor.directive';
registrar.directive('tagEditor', TagEditorComponent);

import CommentsComponent from 'components/comments/comments.directive';
import CommentsController from 'components/comments/comments.controller';
registrar.directive('comments', CommentsComponent);
registrar.controller('CommentsController', CommentsController);

import WriteCommentComponent from 'components/comments/write-comment/write-comment.directive';
import WriteCommentController from 'components/comments/write-comment/write-comment.controller';
registrar.directive('writeComment', WriteCommentComponent);
registrar.controller('WriteCommentController', WriteCommentController);

import CommentThreadComponent from 'components/comments/comment-thread/comment-thread.directive';
import CommentThreadController from 'components/comments/comment-thread/comment-thread.controller';
registrar.directive('commentThread', CommentThreadComponent);
registrar.controller('CommentThreadController', CommentThreadController);

import PollAnswerEditorComponent from 'components/poll-answer-editor/poll-answer-editor.directive';
registrar.directive('pollAnswerEditor', PollAnswerEditorComponent);

import ChartComponent from 'components/chart/chart.directive';
registrar.directive('chart', ChartComponent);

import ModalComponent from 'components/modal/modal.directive';
registrar.directive('modal', ModalComponent);

import ProfileSettingsModalController from 'components/modal/profile/settings/controller';

registrar.controller('ProfileSettingsModalController', ProfileSettingsModalController);


import BranchNucleusSettingsModalController from 'components/modal/branch/nucleus/settings/settings.modal.controller';
registrar.controller('BranchNucleusSettingsModalController', BranchNucleusSettingsModalController);
import AddModModalController from 'components/modal/branch/nucleus/modtools/add-mod/add-mod.modal.controller';
registrar.controller('AddModModalController', AddModModalController);
import DeleteBranchModalController from 'components/modal/branch/nucleus/modtools/delete-branch/delete-branch.modal.controller';
registrar.controller('DeleteBranchModalController', DeleteBranchModalController);
import RemoveModModalController from 'components/modal/branch/nucleus/modtools/remove-mod/remove-mod.modal.controller';
registrar.controller('RemoveModModalController', RemoveModModalController);
import ReviewSubbranchRequestsModalController from 'components/modal/branch/nucleus/modtools/review-subbranch-requests/review-subbranch-requests.modal.controller';
registrar.controller('ReviewSubbranchRequestsModalController', ReviewSubbranchRequestsModalController);
import SubmitSubbranchRequestModalController from 'components/modal/branch/nucleus/modtools/submit-subbranch-request/submit-subbranch-request.modal.controller';
registrar.controller('SubmitSubbranchRequestModalController', SubmitSubbranchRequestModalController);
import UpdateHomepageStatsModalController from 'components/modal/branch/nucleus/modtools/update-homepage-stats/update-homepage-stats.modal.controller';
registrar.controller('UpdateHomepageStatsModalController', UpdateHomepageStatsModalController);
import FlagPostModalController from 'components/modal/post/flag/flag-post.modal.controller';
registrar.controller('FlagPostModalController', FlagPostModalController);
import CreatePostModalController from 'components/modal/post/create/create-post.modal.controller';
registrar.controller('CreatePostModalController', CreatePostModalController);
import DeletePostModalController from 'components/modal/post/delete/delete-post.modal.controller';
registrar.controller('DeletePostModalController', DeletePostModalController);
import ResolveFlagPostModalController from 'components/modal/post/flag/resolve/resolve-flag-post.modal.controller';
registrar.controller('ResolveFlagPostModalController', ResolveFlagPostModalController);
import CreateBranchModalController from 'components/modal/branch/create/create-branch.modal.controller';
registrar.controller('CreateBranchModalController', CreateBranchModalController);
import SubmitPollAnswerModalController from 'components/modal/post/submit-poll-answer/submit-poll-answer.modal.controller';
registrar.controller('SubmitPollAnswerModalController', SubmitPollAnswerModalController);
