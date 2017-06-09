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
const registrar = new ComponentRegistrar('wecoApp');

// Config
import AppConfig from 'app.config';
import AppRoutes from 'app.routes';

registrar.config(AppConfig);
registrar.config(AppRoutes);



// SERVICES.
import initServices from 'services/_init';
initServices(registrar);


// Controllers
import AppController from 'app.controller';
import AuthController from 'pages/auth/controller';
import BranchController from 'pages/branch/controller';
import BranchNucleusAboutController from 'pages/branch/nucleus/about/controller';
import BranchNucleusController from 'pages/branch/nucleus/controller';
import BranchNucleusFlaggedPostsController from 'pages/branch/nucleus/flagged-posts/controller';
import BranchNucleusModeratorsController from 'pages/branch/nucleus/moderators/controller';
import BranchNucleusModtoolsController from 'pages/branch/nucleus/modtools/controller';
import BranchNucleusSettingsController from 'pages/branch/nucleus/settings/controller';
import BranchPostController from 'pages/branch/post/controller';
import BranchPostResultsController from 'pages/branch/post/results/controller';
import BranchPostVoteController from 'pages/branch/post/vote/controller';
import BranchSubbranchesController from 'pages/branch/subbranches/controller';
import BranchWallController from 'pages/branch/wall/controller';
import HomeController from 'pages/home/controller';
import ProfileController from 'pages/profile/controller';
import ProfileNotificationsController from 'pages/profile/notifications/controller';
import ProfileSettingsController from 'pages/profile/settings/controller';
import ResetPasswordController from 'pages/auth/reset-password/controller';
import TooltipController from 'components/tooltip/controller';
import VerifyController from 'pages/auth/verify/controller';

registrar.controller('AppController', AppController);
registrar.controller('AuthController', AuthController);
registrar.controller('BranchController', BranchController);
registrar.controller('BranchNucleusAboutController', BranchNucleusAboutController);
registrar.controller('BranchNucleusController', BranchNucleusController);
registrar.controller('BranchNucleusFlaggedPostsController', BranchNucleusFlaggedPostsController);
registrar.controller('BranchNucleusModeratorsController', BranchNucleusModeratorsController);
registrar.controller('BranchNucleusModtoolsController', BranchNucleusModtoolsController);
registrar.controller('BranchNucleusSettingsController', BranchNucleusSettingsController);
registrar.controller('BranchPostController', BranchPostController);
registrar.controller('BranchPostResultsController', BranchPostResultsController);
registrar.controller('BranchPostVoteController', BranchPostVoteController);
registrar.controller('BranchSubbranchesController', BranchSubbranchesController);
registrar.controller('BranchWallController', BranchWallController);
registrar.controller('HomeController', HomeController);
registrar.controller('ProfileController', ProfileController);
registrar.controller('ProfileNotificationsController', ProfileNotificationsController);
registrar.controller('ProfileSettingsController', ProfileSettingsController);
registrar.controller('ResetPasswordController', ResetPasswordController);
registrar.controller('TooltipController', TooltipController);
registrar.controller('VerifyController', VerifyController);



// Components
import CoverPhotoComponent from 'components/cover-photo/directive';
import CoverPhotoController from 'components/cover-photo/controller';
import DropdownComponent from 'components/dropdown/directive';
import ListItemComponent from 'components/list-item/directive';
import ListItemController from 'components/list-item/controller';
import LoadingComponent from 'components/loading/directive';
import NavbarComponent from 'components/nav-bar/directive';
import NavbarController from 'components/nav-bar/controller';
import OnScrollToBottomComponent from 'components/on-scroll-to-bottom/directive';
import ProfileSettingsModalController from 'components/modal/profile/settings/controller';
import SubmitPollAnswerModalController from 'components/modal/post/submit-poll-answer/controller';
import TooltipComponent from 'components/tooltip/directive';
import UploadImageModalController from 'components/modal/upload-image/controller';

registrar.directive('coverPhoto', CoverPhotoComponent);
registrar.controller('CoverPhotoController', CoverPhotoController);
registrar.directive('dropdown', DropdownComponent);
registrar.directive('listItem', ListItemComponent);
registrar.controller('ListItemController', ListItemController);
registrar.directive('loading', LoadingComponent);
registrar.directive('navBar', NavbarComponent);
registrar.controller('NavbarController', NavbarController);
registrar.directive('onScrollToBottom', OnScrollToBottomComponent);
registrar.controller('SubmitPollAnswerModalController', SubmitPollAnswerModalController);
registrar.controller('ProfileSettingsModalController', ProfileSettingsModalController);
registrar.directive('tooltip', TooltipComponent);
registrar.controller('UploadImageModalController', UploadImageModalController);

import AlertsComponent from 'components/alerts/alerts.directive';
registrar.directive('alerts', AlertsComponent);

import TabsComponent from 'components/tabs/tabs.directive';
import TabsController from 'components/tabs/tabs.controller';
registrar.directive('tabs', TabsComponent);
registrar.controller('TabsController', TabsController);

import ModLogEntryComponent from 'components/mod-log-entry/mod-log-entry.directive';
registrar.directive('modLogEntry', ModLogEntryComponent);

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
