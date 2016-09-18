// @if SSL='true'
option_settings:
  aws:elb:listener:443:
    ListenerProtocol: HTTPS
    SSLCertificateId: arn:aws:acm:eu-west-1:470576480462:certificate/5d047b42-6afc-46ef-bd89-15ad0a0163ac
    InstancePort: 80
    InstanceProtocol: HTTP
  aws:elb:listener:80:
    ListenerEnabled: false
// @endif
