"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEventType = void 0;
var SocketEventType;
(function (SocketEventType) {
    SocketEventType["Connect"] = "connect";
    SocketEventType["Disconnect"] = "disconnect";
    SocketEventType["HireDeveloper"] = "hireDeveloper";
    SocketEventType["Welcome"] = "welcome";
    SocketEventType["EndMeeting"] = "endMeeting";
    SocketEventType["DeveloperAssigned"] = "developerAssigned";
})(SocketEventType || (exports.SocketEventType = SocketEventType = {}));
