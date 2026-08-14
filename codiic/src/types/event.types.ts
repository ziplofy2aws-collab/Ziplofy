export enum SocketEventType {
  Connect = 'connect',
  Disconnect = 'disconnect',
  HireDeveloper = 'hireDeveloper',
  Welcome = 'welcome',
  EndMeeting = 'endMeeting',
  DeveloperAssigned = 'developerAssigned',
  ClientSessionJoin = 'client:session:join',
  ClientSessionLeave = 'client:session:leave',
  AnalyticsSubscribe = 'analytics:subscribe',
  AnalyticsUnsubscribe = 'analytics:unsubscribe',
  StoreSessionsUpdate = 'store:sessions:update',
  StoreLiveCommerceUpdate = 'store:live:commerce:update',
}
