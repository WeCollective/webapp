import Alerts from 'components/alerts/service';
import API from 'services/api';
import App from 'app.service';
import Auth from 'services/auth';
import Branch from 'services/branch';
import Comment from 'services/comment';
import Event from 'services/event';
import LocalStorage from 'services/localstorage';
import Mod from 'services/mod';
import Modal from 'components/modal/service';
import Post from 'services/post';
import Tooltip from 'components/tooltip/service';
import Upload from 'services/upload';
import User from 'services/user';
import Wall from 'pages/branch/service';

const refs = [
  { name: 'AlertsService', module: Alerts },
  { name: 'API', module: API },
  { name: 'AppService', module: App },
  { name: 'Auth', module: Auth },
  { name: 'BranchService', module: Branch },
  { name: 'CommentService', module: Comment },
  { name: 'EventService', module: Event },
  { name: 'LocalStorageService', module: LocalStorage },
  { name: 'ModService', module: Mod },
  { name: 'ModalService', module: Modal },
  { name: 'PostService', module: Post },
  { name: 'TooltipService', module: Tooltip },
  { name: 'UploadService', module: Upload },
  { name: 'UserService', module: User },
  { name: 'WallService', module: Wall },
];

const services = registrar => {
  if (!registrar) throw new Error('Cannot register services - no registrar provided.');
  refs.forEach(ref => registrar.service(ref.name, ref.module));
};

export default services;
