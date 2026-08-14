export enum SocketEventType {
  Connect = 'connect',
  Disconnect = 'disconnect',
  HireDeveloper = 'hireDeveloper',
  Welcome = 'welcome',
  EndMeeting = 'endMeeting',
  DeveloperAssigned = 'developerAssigned',
  /** Storefront visitor announces live presence (device + store). */
  ClientSessionJoin = 'client:session:join',
  /** Storefront visitor leaves (optional; disconnect also clears). */
  ClientSessionLeave = 'client:session:leave',
  /** Admin Analytics joins a store live-presence room. */
  AnalyticsSubscribe = 'analytics:subscribe',
  /** Admin Analytics leaves a store live-presence room. */
  AnalyticsUnsubscribe = 'analytics:unsubscribe',
  /** Server → admin: aggregated live sessions snapshot for a store. */
  StoreSessionsUpdate = 'store:sessions:update',
  /** Server → admin: live orders + total sales snapshot for a store. */
  StoreLiveCommerceUpdate = 'store:live:commerce:update',
}
