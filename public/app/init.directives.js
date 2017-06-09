import AlertsComponent from './components/alerts/directive';
import ChartComponent from './components/chart/directive';
import CommentsComponent from './components/comments/directive';
import CommentThreadComponent from './components/comments/comment-thread/directive';
import CoverPhotoComponent from './components/cover-photo/directive';
import DropdownComponent from './components/dropdown/directive';
import ListItemComponent from './components/list-item/directive';
import LoadingComponent from './components/loading/directive';
import ModalComponent from './components/modal/directive';
import ModLogEntryComponent from './components/mod-log-entry/directive';
import NavbarComponent from './components/nav-bar/directive';
import NotificationComponent from './components/notification/directive';
import OnScrollToBottomComponent from './components/on-scroll-to-bottom/directive';
import PollAnswerEditorComponent from './components/poll-answer-editor/directive';
import TabsComponent from './components/tabs/directive';
import TagEditorComponent from './components/tag-editor/directive';
import TooltipComponent from './components/tooltip/directive';
import WriteCommentComponent from './components/comments/write-comment/directive';

let refs = [
  { name: 'alerts', module: AlertsComponent },
  { name: 'chart', module: ChartComponent },
  { name: 'comments', module: CommentsComponent },
  { name: 'commentThread', module: CommentThreadComponent },
  { name: 'coverPhoto', module: CoverPhotoComponent },
  { name: 'dropdown', module: DropdownComponent },
  { name: 'listItem', module: ListItemComponent },
  { name: 'loading', module: LoadingComponent },
  { name: 'modal', module: ModalComponent },
  { name: 'modLogEntry', module: ModLogEntryComponent },
  { name: 'navBar', module: NavbarComponent },
  { name: 'notification', module: NotificationComponent },
  { name: 'onScrollToBottom', module: OnScrollToBottomComponent },
  { name: 'pollAnswerEditor', module: PollAnswerEditorComponent },
  { name: 'tabs', module: TabsComponent },
  { name: 'tagEditor', module: TagEditorComponent },
  { name: 'tooltip', module: TooltipComponent },
  { name: 'writeComment', module: WriteCommentComponent }
];

const directives = (registrar) => {
  if (!registrar) throw new Error('Cannot register directives - no registrar provided.');
  refs.forEach(ref => registrar.directive(ref.name, ref.module));
};

export default directives;
