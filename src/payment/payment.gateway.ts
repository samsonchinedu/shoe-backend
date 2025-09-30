import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";


@WebSocketGateway({
    cors: {
        origin: '*',
    }
})

export class PaymentGateway { 
    @WebSocketServer()
    server: Server;

    // Method to emit payment updates
    emitPaymentUpdate(data: any) {
        this.server.emit('paymentUpdate', data);
    }
}