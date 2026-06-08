import { Socket } from "socket.io";
import { SocketEventType } from "../../types/event.types";

export interface WelcomeEventPayloadType {
  message: string;
}

export const sendWelcomeEvent = (socket: Socket, socketUser: { name: string; superAdmin?: boolean }) => {
    const welcomePayload: WelcomeEventPayloadType = {
        message: socketUser.superAdmin ? `Welcome admin ${socketUser.name}` : `Welcome Client ${socketUser.name}`
    }
    socket.emit(SocketEventType.Welcome, welcomePayload);
};
