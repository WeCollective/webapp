import AlertsService from './../components/alerts/alerts.service';
import API from './api';
import AppService from './../app.service';
import BranchService from './branch';
import CommentService from './comment';
import EventService from './event';
import ModService from './mod';
import ModalService from './../components/modal/service';
import PostService from './post';
import TooltipService from './../components/tooltip/service';
import UploadService from './upload';
import UserService from './user';
import WallService from './../pages/branch/service';

let refs = [
  { name: 'AlertsService', service: AlertsService },
  { name: 'API', service: API },
  { name: 'AppService', service: AppService },
  { name: 'BranchService', service: BranchService },
  { name: 'CommentService', service: CommentService },
  { name: 'EventService', service: EventService },
  { name: 'ModService', service: ModService },
  { name: 'ModalService', service: ModalService },
  { name: 'PostService', service: PostService },
  { name: 'TooltipService', service: TooltipService },
  { name: 'UploadService', service: UploadService },
  { name: 'UserService', service: UserService },
  { name: 'WallService', service: WallService }
];

const services = (registrar) => {
  if (!registrar) throw new Error('Cannot register services - no registrar provided.');
  refs.forEach(ref => registrar.service(ref.name, ref.service));
};

export default services;
