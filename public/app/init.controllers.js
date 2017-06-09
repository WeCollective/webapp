import AppController from './app.controller';
import AuthController from './pages/auth/controller';
import BranchController from './pages/branch/controller';
import BranchNucleusAboutController from './pages/branch/nucleus/about/controller';
import BranchNucleusController from './pages/branch/nucleus/controller';
import BranchNucleusFlaggedPostsController from './pages/branch/nucleus/flagged-posts/controller';
import BranchNucleusModeratorsController from './pages/branch/nucleus/moderators/controller';
import BranchNucleusModtoolsController from './pages/branch/nucleus/modtools/controller';
import BranchNucleusSettingsController from './pages/branch/nucleus/settings/controller';
import BranchPostController from './pages/branch/post/controller';
import BranchPostResultsController from './pages/branch/post/results/controller';
import BranchPostVoteController from './pages/branch/post/vote/controller';
import BranchSubbranchesController from './pages/branch/subbranches/controller';
import BranchWallController from './pages/branch/wall/controller';
import HomeController from './pages/home/controller';
import ProfileController from './pages/profile/controller';
import ProfileNotificationsController from './pages/profile/notifications/controller';
import ProfileSettingsController from './pages/profile/settings/controller';
import ResetPasswordController from './pages/auth/reset-password/controller';
import TooltipController from './components/tooltip/controller';
import VerifyController from './pages/auth/verify/controller';

// Components.
import AddModModalController from './components/modal/branch/nucleus/modtools/add-mod/controller';
import BranchNucleusSettingsModalController from './components/modal/branch/nucleus/settings/controller';
import CommentsController from './components/comments/controller';
import CommentThreadController from './components/comments/comment-thread/controller';
import CoverPhotoController from './components/cover-photo/controller';
import CreateBranchModalController from './components/modal/branch/create/controller';
import CreatePostModalController from './components/modal/post/create/controller';
import DeleteBranchModalController from './components/modal/branch/nucleus/modtools/delete-branch/controller';
import DeletePostModalController from './components/modal/post/delete/controller';
import FlagPostModalController from './components/modal/post/flag/controller';
import ListItemController from './components/list-item/controller';
import NavbarController from './components/nav-bar/controller';
import ProfileSettingsModalController from './components/modal/profile/settings/controller';
import RemoveModModalController from './components/modal/branch/nucleus/modtools/remove-mod/controller';
import ResolveFlagPostModalController from './components/modal/post/flag/resolve/controller';
import ReviewSubbranchRequestsModalController from './components/modal/branch/nucleus/modtools/review-subbranch-requests/controller';
import SubmitPollAnswerModalController from './components/modal/post/submit-poll-answer/controller';
import SubmitSubbranchRequestModalController from './components/modal/branch/nucleus/modtools/submit-subbranch-request/controller';
import TabsController from './components/tabs/controller';
import UpdateHomepageStatsModalController from './components/modal/branch/nucleus/modtools/update-homepage-stats/controller';
import UploadImageModalController from './components/modal/upload-image/controller';
import WriteCommentController from './components/comments/write-comment/controller';

let refs = [
  { name: 'AppController', module: AppController },
  { name: 'AuthController', module: AuthController },
  { name: 'BranchController', module: BranchController },
  { name: 'BranchNucleusAboutController', module: BranchNucleusAboutController },
  { name: 'BranchNucleusController', module: BranchNucleusController },
  { name: 'BranchNucleusFlaggedPostsController', module: BranchNucleusFlaggedPostsController },
  { name: 'BranchNucleusModeratorsController', module: BranchNucleusModeratorsController },
  { name: 'BranchNucleusModtoolsController', module: BranchNucleusModtoolsController },
  { name: 'BranchNucleusSettingsController', module: BranchNucleusSettingsController },
  { name: 'BranchPostController', module: BranchPostController },
  { name: 'BranchPostResultsController', module: BranchPostResultsController },
  { name: 'BranchPostVoteController', module: BranchPostVoteController },
  { name: 'BranchSubbranchesController', module: BranchSubbranchesController },
  { name: 'BranchWallController', module: BranchWallController },
  { name: 'HomeController', module: HomeController },
  { name: 'ProfileController', module: ProfileController },
  { name: 'ProfileNotificationsController', module: ProfileNotificationsController },
  { name: 'ProfileSettingsController', module: ProfileSettingsController },
  { name: 'ResetPasswordController', module: ResetPasswordController },
  { name: 'TooltipController', module: TooltipController },
  { name: 'VerifyController', module: VerifyController },
  
  { name: 'AddModModalController', module: AddModModalController },
  { name: 'BranchNucleusSettingsModalController', module: BranchNucleusSettingsModalController },
  { name: 'CommentsController', module: CommentsController },
  { name: 'CommentThreadController', module: CommentThreadController },
  { name: 'CoverPhotoController', module: CoverPhotoController },
  { name: 'CreateBranchModalController', module: CreateBranchModalController },
  { name: 'CreatePostModalController', module: CreatePostModalController },
  { name: 'DeleteBranchModalController', module: DeleteBranchModalController },
  { name: 'DeletePostModalController', module: DeletePostModalController },
  { name: 'FlagPostModalController', module: FlagPostModalController },
  { name: 'ListItemController', module: ListItemController },
  { name: 'NavbarController', module: NavbarController },
  { name: 'ProfileSettingsModalController', module: ProfileSettingsModalController },
  { name: 'RemoveModModalController', module: RemoveModModalController },
  { name: 'ResolveFlagPostModalController', module: ResolveFlagPostModalController },
  { name: 'ReviewSubbranchRequestsModalController', module: ReviewSubbranchRequestsModalController },
  { name: 'SubmitPollAnswerModalController', module: SubmitPollAnswerModalController },
  { name: 'SubmitSubbranchRequestModalController', module: SubmitSubbranchRequestModalController },
  { name: 'TabsController', module: TabsController },
  { name: 'UpdateHomepageStatsModalController', module: UpdateHomepageStatsModalController },
  { name: 'UploadImageModalController', module: UploadImageModalController },
  { name: 'WriteCommentController', module: WriteCommentController }
];

const controllers = (registrar) => {
  if (!registrar) throw new Error('Cannot register controllers - no registrar provided.');
  refs.forEach(ref => registrar.controller(ref.name, ref.module));
};

export default controllers;
