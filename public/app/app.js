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

import NotificationTypes from 'components/notification/notification-types.config.js';
app.constant('NotificationTypes', NotificationTypes);

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
registrar.config(AppConfig);
import AppRoutes from 'app.routes';
registrar.config(AppRoutes);

// Services
import AppService from 'app.service';
registrar.service('AppService', AppService);
import API from 'data/api.service';
registrar.service('API', API);
import EventService from 'data/event.service';
registrar.service('EventService', EventService);
import UserService from 'data/user.service';
registrar.service('UserService', UserService);
import BranchService from 'data/branch.service';
registrar.service('BranchService', BranchService);
import ModService from 'data/mod.service';
registrar.service('ModService', ModService);
import PostService from 'data/post.service';
registrar.service('PostService', PostService);
import UploadService from 'data/upload.service';
registrar.service('UploadService', UploadService);
import CommentService from 'data/comment.service';
registrar.service('CommentService', CommentService);
import WallService from 'pages/branch/wall.service';
registrar.service('WallService', WallService);
import AlertsService from 'components/alerts/alerts.service';
registrar.service('AlertsService', AlertsService);
import TooltipService from 'components/tooltip/tooltip.service';
registrar.service('TooltipService', TooltipService);
import ModalService from 'components/modal/modal.service';
registrar.service('ModalService', ModalService);

// Controllers
import AppController from 'app.controller';
registrar.controller('AppController', AppController);
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
import ProfileNotificationsController from 'pages/profile/notifications/notifications.controller';
registrar.controller('ProfileNotificationsController', ProfileNotificationsController);
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
import BranchWallController from 'pages/branch/wall/wall.controller';
registrar.controller('BranchWallController', BranchWallController);
import BranchPostController from 'pages/branch/post/post.controller';
registrar.controller('BranchPostController', BranchPostController);
import BranchPostVoteController from 'pages/branch/post/vote/vote.controller';
registrar.controller('BranchPostVoteController', BranchPostVoteController);

// Components
import NavBarComponent from 'components/nav-bar/nav-bar.directive';
import NavBarController from 'components/nav-bar/nav-bar.controller';
registrar.directive('navBar', NavBarComponent);
registrar.controller('NavBarController', NavBarController);

import CoverPhotoComponent from 'components/cover-photo/cover-photo.directive';
import CoverPhotoController from 'components/cover-photo/cover-photo.controller';
registrar.directive('coverPhoto', CoverPhotoComponent);
registrar.controller('CoverPhotoController', CoverPhotoController);

import AlertsComponent from 'components/alerts/alerts.directive';
registrar.directive('alerts', AlertsComponent);

import TooltipComponent from 'components/tooltip/tooltip.directive';
registrar.directive('tooltip', TooltipComponent);

import LoadingComponent from 'components/loading/loading.directive';
registrar.directive('loading', LoadingComponent);

import TabsComponent from 'components/tabs/tabs.directive';
import TabsController from 'components/tabs/tabs.controller';
registrar.directive('tabs', TabsComponent);
registrar.controller('TabsController', TabsController);

import ModLogEntryComponent from 'components/mod-log-entry/mod-log-entry.directive';
registrar.directive('modLogEntry', ModLogEntryComponent);

import DropdownComponent from 'components/dropdown/dropdown.directive';
registrar.directive('dropdown', DropdownComponent);

import OnScrollToBottomComponent from 'components/on-scroll-to-bottom/on-scroll-to-bottom.directive';
registrar.directive('onScrollToBottom', OnScrollToBottomComponent);

import NotificationComponent from 'components/notification/notification-item.directive';
registrar.directive('notification', NotificationComponent);

import TagEditorComponent from 'components/tag-editor/tag-editor.directive';
registrar.directive('tagEditor', TagEditorComponent);

import ListItemComponent from 'components/list-item/list-item.directive';
import ListItemController from 'components/list-item/list-item.controller';
registrar.directive('listItem', ListItemComponent);
registrar.controller('ListItemController', ListItemController);

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

import ModalComponent from 'components/modal/modal.directive';
registrar.directive('modal', ModalComponent);
import ProfileSettingsModalController from 'components/modal/profile/settings/settings.modal.controller';
registrar.controller('ProfileSettingsModalController', ProfileSettingsModalController);
import UploadImageModalController from 'components/modal/upload-image/upload-image.modal.controller';
registrar.controller('UploadImageModalController', UploadImageModalController);
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
import ResolveFlagPostModalController from 'components/modal/post/flag/resolve/resolve-flag-post.modal.controller';
registrar.controller('ResolveFlagPostModalController', ResolveFlagPostModalController);
import CreateBranchModalController from 'components/modal/branch/create/create-branch.modal.controller';
registrar.controller('CreateBranchModalController', CreateBranchModalController);
