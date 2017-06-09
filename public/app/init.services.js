import AlertsService from './components/alerts/service';
import API from './services/api';
import AppService from './app.service';
import BranchService from './services/branch';
import CommentService from './services/comment';
import EventService from './services/event';
import ModService from './services/mod';
import ModalService from './components/modal/service';
import PostService from './services/post';
import TooltipService from './components/tooltip/service';
import UploadService from './services/upload';
import UserService from './services/user';
import WallService from './pages/branch/service';

let refs = [
  { name: 'AlertsService', module: AlertsService },
  { name: 'API', module: API },
  { name: 'AppService', module: AppService },
  { name: 'BranchService', module: BranchService },
  { name: 'CommentService', module: CommentService },
  { name: 'EventService', module: EventService },
  { name: 'ModService', module: ModService },
  { name: 'ModalService', module: ModalService },
  { name: 'PostService', module: PostService },
  { name: 'TooltipService', module: TooltipService },
  { name: 'UploadService', module: UploadService },
  { name: 'UserService', module: UserService },
  { name: 'WallService', module: WallService }
];

const services = (registrar) => {
  if (!registrar) throw new Error('Cannot register services - no registrar provided.');
  refs.forEach(ref => registrar.service(ref.name, ref.module));
};

export default services;
