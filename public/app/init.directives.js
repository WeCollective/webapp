import Alerts from './components/alerts/directive';
import CardBranch from './components/card-branch/directive';
import CardPollAnswer from './components/card-poll-answer/directive';
import Chart from './components/chart/directive';
import Comments from './components/comments/directive';
import CommentThread from './components/comments/comment-thread/directive';
import CoverPhoto from './components/cover-photo/directive';
import Dropdown from './components/dropdown/directive';
import ListItem from './components/list-item/directive';
import Loading from './components/loading/directive';
import Modal from './components/modal/directive';
import ModLogEntry from './components/mod-log-entry/directive';
import Navbar from './components/nav-bar/directive';
import Notification from './components/notification/directive';
import OnScrollToBottom from './components/on-scroll-to-bottom/directive';
import PollAnswerEditor from './components/poll-answer-editor/directive';
import Tabs from './components/tabs/directive';
import TagEditor from './components/tag-editor/directive';
import Tooltip from './components/tooltip/directive';
import WriteComment from './components/comments/write-comment/directive';

let refs = [
  { name: 'alerts', module: Alerts },
  { name: 'cardBranch', module: CardBranch },
  { name: 'cardPollAnswer', module: CardPollAnswer },
  { name: 'chart', module: Chart },
  { name: 'comments', module: Comments },
  { name: 'commentThread', module: CommentThread },
  { name: 'coverPhoto', module: CoverPhoto },
  { name: 'dropdown', module: Dropdown },
  { name: 'listItem', module: ListItem },
  { name: 'loading', module: Loading },
  { name: 'modal', module: Modal },
  { name: 'modLogEntry', module: ModLogEntry },
  { name: 'navBar', module: Navbar },
  { name: 'notification', module: Notification },
  { name: 'onScrollToBottom', module: OnScrollToBottom },
  { name: 'pollAnswerEditor', module: PollAnswerEditor },
  { name: 'tabs', module: Tabs },
  { name: 'tagEditor', module: TagEditor },
  { name: 'tooltip', module: Tooltip },
  { name: 'writeComment', module: WriteComment }
];

const directives = (registrar) => {
  if (!registrar) throw new Error('Cannot register directives - no registrar provided.');
  refs.forEach(ref => registrar.directive(ref.name, ref.module));
};

export default directives;
