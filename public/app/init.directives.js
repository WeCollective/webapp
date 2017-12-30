import Alerts from './components/alerts/directive';
import CardBranch from './components/card-branch/directive';
import CardListItem from './components/card-list-item/directive';
import CardPollAnswer from './components/card-poll-answer/directive';
import Chart from './components/chart/directive';
import CommentInputBox from './components/comments/input/directive';
import Comments from './components/comments/directive';
import CommentThread from './components/comments/thread/directive';
import CoverPhoto from './components/cover-photo/directive';
import Dropdown from './components/dropdown/directive';
import EmitOnScrollToBottom from './components/on-scroll-to-bottom/directive';
import Loading from './components/loading/directive';
import LoaderBar from './components/loader-bar/directive';
import Modal from './components/modal/directive';
import ModLogEntry from './components/mod-log-entry/directive';
import Navbar from './components/navbar/directive';
import NoConstructorTransition from './components/no-constructor-transition/directive';
import Notification from './components/notification/directive';
import PollAnswerEditor from './components/poll-answer-editor/directive';
import Sidebar from './components/sidebar/directive';
import Tabs from './components/tabs/directive';
import TagEditor from './components/tag-editor/directive';
import Tooltip from './components/tooltip/directive';

const refs = [
  { name: 'alerts', module: Alerts },
  { name: 'cardBranch', module: CardBranch },
  { name: 'cardPollAnswer', module: CardPollAnswer },
  { name: 'chart', module: Chart },
  { name: 'commentInputBox', module: CommentInputBox },
  { name: 'comments', module: Comments },
  { name: 'commentThread', module: CommentThread },
  { name: 'coverPhoto', module: CoverPhoto },
  { name: 'dropdown', module: Dropdown },
  { name: 'emitOnScrollToBottom', module: EmitOnScrollToBottom },
  { name: 'listItem', module: CardListItem },
  { name: 'loaderBar', module: LoaderBar },
  { name: 'loading', module: Loading },
  { name: 'modal', module: Modal },
  { name: 'modLogEntry', module: ModLogEntry },
  { name: 'navbar', module: Navbar },
  { name: 'noConstructorTransition', module: NoConstructorTransition },
  { name: 'notification', module: Notification },
  { name: 'pollAnswerEditor', module: PollAnswerEditor },
  { name: 'sidebar', module: Sidebar },
  { name: 'tabs', module: Tabs },
  { name: 'tagEditor', module: TagEditor },
  { name: 'tooltip', module: Tooltip },
];

const directives = registrar => {
  if (!registrar) throw new Error('Cannot register directives - no registrar provided.');
  refs.forEach(ref => registrar.directive(ref.name, ref.module));
};

export default directives;
