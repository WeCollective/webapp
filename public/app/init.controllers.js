import App from './app.controller';
import Auth from './pages/auth/controller';
import Branch from './pages/branch/controller';
import BranchNucleusAbout from './pages/branch/nucleus/about/controller';
import BranchNucleus from './pages/branch/nucleus/controller';
import BranchNucleusFlaggedPosts from './pages/branch/nucleus/flagged-posts/controller';
import BranchNucleusModerators from './pages/branch/nucleus/moderators/controller';
import BranchNucleusModtools from './pages/branch/nucleus/modtools/controller';
import BranchNucleusSettings from './pages/branch/nucleus/settings/controller';
import BranchPost from './pages/branch/post/controller';
import BranchPostResults from './pages/branch/post/results/controller';
import BranchPostVote from './pages/branch/post/vote/controller';
import BranchSubbranches from './pages/branch/subbranches/controller';
import BranchWall from './pages/branch/wall/controller';
import Home from './pages/home/controller';
import Profile from './pages/profile/controller';
import ProfileNotifications from './pages/profile/notifications/controller';
import ProfileSettings from './pages/profile/settings/controller';
import ResetPassword from './pages/auth/reset-password/controller';
import Tooltip from './components/tooltip/controller';
import Verify from './pages/auth/verify/controller';

// Components.
import BanUserModal from './components/modal/branch/nucleus/modtools/ban-user/controller';
import BranchDeleteModal from './components/modal/branch/nucleus/modtools/branch-delete/controller';
import BranchDetachChildModal from './components/modal/branch/nucleus/modtools/branch-detach-child/controller';
import BranchNucleusSettingsModal from './components/modal/branch/nucleus/settings/controller';
import BranchRequestModal from './components/modal/branch/nucleus/modtools/branch-request/controller';
import BranchReviewModal from './components/modal/branch/nucleus/modtools/branch-review/controller';
import CardBranch from './components/card-branch/controller';
import CardListItem from './components/card-list-item/controller';
import CardPollAnswer from './components/card-poll-answer/controller';
import CommentInputBox from './components/comments/input/controller';
import Comments from './components/comments/controller';
import CommentThread from './components/comments/thread/controller';
import CoverPhoto from './components/cover-photo/controller';
import CreateBranchModal from './components/modal/branch/create/controller';
import CreatePostModal from './components/modal/post/create/controller';
import DeleteCommentModal from './components/modal/comment/delete/controller';
import DeletePostModal from './components/modal/post/delete/controller';
import DropdownController from './components/dropdown/controller';
import FlagPostModal from './components/modal/post/flag/controller';
import LoaderBar from './components/loader-bar/controller';
import ModAddModal from './components/modal/branch/nucleus/modtools/mod-add/controller';
import ModDeleteModal from './components/modal/branch/nucleus/modtools/mod-delete/controller';
import Navbar from './components/nav-bar/controller';
import ProfileSettingsModal from './components/modal/profile/settings/controller';
import ResolveFlagPostModal from './components/modal/post/flag/resolve/controller';
import SubmitPollAnswerModal from './components/modal/post/submit-poll-answer/controller';
import Tabs from './components/tabs/controller';
import TagEditor from './components/tag-editor/controller';
import PollAnswerEditor from './components/poll-answer-editor/controller';
import UpdateHomepageStatsModal from './components/modal/branch/nucleus/modtools/homepage-stats/controller';
import UploadImageModal from './components/modal/upload-image/controller';

const refs = [
  { name: 'AppController', module: App },
  { name: 'AuthController', module: Auth },
  { name: 'BranchController', module: Branch },
  { name: 'BranchNucleusAboutController', module: BranchNucleusAbout },
  { name: 'BranchNucleusController', module: BranchNucleus },
  { name: 'BranchNucleusFlaggedPostsController', module: BranchNucleusFlaggedPosts },
  { name: 'BranchNucleusModeratorsController', module: BranchNucleusModerators },
  { name: 'BranchNucleusModtoolsController', module: BranchNucleusModtools },
  { name: 'BranchNucleusSettingsController', module: BranchNucleusSettings },
  { name: 'BranchPostController', module: BranchPost },
  { name: 'BranchPostResultsController', module: BranchPostResults },
  { name: 'BranchPostVoteController', module: BranchPostVote },
  { name: 'BranchSubbranchesController', module: BranchSubbranches },
  { name: 'BranchWallController', module: BranchWall },
  { name: 'HomeController', module: Home },
  { name: 'ProfileController', module: Profile },
  { name: 'ProfileNotificationsController', module: ProfileNotifications },
  { name: 'ProfileSettingsController', module: ProfileSettings },
  { name: 'ResetPasswordController', module: ResetPassword },
  { name: 'TooltipController', module: Tooltip },
  { name: 'VerifyController', module: Verify },

  { name: 'AddModModalController', module: ModAddModal },
  { name: 'BanUserModalController', module: BanUserModal },
  { name: 'BranchNucleusSettingsModalController', module: BranchNucleusSettingsModal },
  { name: 'CardBranchController', module: CardBranch },
  { name: 'CardPollAnswerController', module: CardPollAnswer },
  { name: 'CommentInputBoxController', module: CommentInputBox },
  { name: 'CommentsController', module: Comments },
  { name: 'CommentThreadController', module: CommentThread },
  { name: 'CoverPhotoController', module: CoverPhoto },
  { name: 'CreateBranchModalController', module: CreateBranchModal },
  { name: 'CreatePostModalController', module: CreatePostModal },
  { name: 'DeleteBranchModalController', module: BranchDeleteModal },
  { name: 'DetachBranchChildModalController', module: BranchDetachChildModal },
  { name: 'DeleteCommentModalController', module: DeleteCommentModal },
  { name: 'DeletePostModalController', module: DeletePostModal },
  { name: 'DropdownController', module: DropdownController },
  { name: 'FlagPostModalController', module: FlagPostModal },
  { name: 'ListItemController', module: CardListItem },
  { name: 'LoaderBarController', module: LoaderBar },
  { name: 'NavbarController', module: Navbar },
  { name: 'PollAnswerEditorController', module: PollAnswerEditor },
  { name: 'ProfileSettingsModalController', module: ProfileSettingsModal },
  { name: 'RemoveModModalController', module: ModDeleteModal },
  { name: 'ResolveFlagPostModalController', module: ResolveFlagPostModal },
  { name: 'ReviewSubbranchRequestsModalController', module: BranchReviewModal },
  { name: 'SubmitPollAnswerModalController', module: SubmitPollAnswerModal },
  { name: 'SubmitSubbranchRequestModalController', module: BranchRequestModal },
  { name: 'TabsController', module: Tabs },
  { name: 'TagEditorController', module: TagEditor },
  { name: 'UpdateHomepageStatsModalController', module: UpdateHomepageStatsModal },
  { name: 'UploadImageModalController', module: UploadImageModal },
];

const controllers = registrar => {
  if (!registrar) throw new Error('Cannot register controllers - no registrar provided.');
  refs.forEach(ref => registrar.controller(ref.name, ref.module));
};

export default controllers;
