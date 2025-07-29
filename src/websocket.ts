// // WebSocket client for real-time data streaming
//
// import { EventEmitter } from 'events';
// import {
//   WebSocketMessage,
//   SubscriptionRequest,
//   TradernetEvent,
//   Ticker,
//   Quote,
//   Order,
//   Portfolio,
// } from './types';
//
//
//
// export class WebSocketClient extends EventEmitter {
//   private ws?: WebSocket;
//   private url: string;
//   private reconnectInterval: number;
//   private maxReconnectAttempts: number;
//   private pingInterval: number;
//   private reconnectAttempts: number = 0;
//   private isConnecting: boolean = false;
//   private isConnected: boolean = false;
//   private authToken?: string;
//   private subscriptions: Set<string> = new Set();
//   private pingTimer?: NodeJS.Timeout;
//   private reconnectTimer?: NodeJS.Timeout;
//
//   constructor(config: WebSocketConfig = {}) {
//     super();
//     this.url = config.url || 'wss://ws.tradernet.com';
//     this.reconnectInterval = config.reconnectInterval || 5000;
//     this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
//     this.pingInterval = config.pingInterval || 30000;
//   }
//
//   setAuthToken(token: string): void {
//     this.authToken = token;
//   }
//
//   async connect(): Promise<void> {
//     if (this.isConnecting || this.isConnected) {
//       return;
//     }
//
//     this.isConnecting = true;
//
//     return new Promise((resolve, reject) => {
//       try {
//         this.ws = new WebSocket(this.url);
//
//         this.ws.onopen = () => {
//           this.isConnecting = false;
//           this.isConnected = true;
//           this.reconnectAttempts = 0;
//
//           this.emit('connected');
//           this.startPing();
//
//           // Authenticate if token is available
//           if (this.authToken) {
//             this.authenticate();
//           }
//
//           resolve();
//         };
//
//         this.ws.onmessage = (event) => {
//           this.handleMessage(event.data);
//         };
//
//         this.ws.onclose = (event) => {
//           this.isConnected = false;
//           this.isConnecting = false;
//           this.stopPing();
//
//           this.emit('disconnected', event.code, event.reason);
//
//           if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
//             this.scheduleReconnect();
//           }
//         };
//
//         this.ws.onerror = (error) => {
//           this.isConnecting = false;
//           this.emit('error', new Error('WebSocket error'));
//           reject(new Error('WebSocket connection failed'));
//         };
//
//       } catch (error) {
//         this.isConnecting = false;
//         reject(error);
//       }
//     });
//   }
//
//   disconnect(): void {
//     if (this.ws) {
//       this.ws.close(1000, 'Client disconnect');
//       this.ws = undefined;
//     }
//     this.stopPing();
//     this.isConnected = false;
//     this.isConnecting = false;
//   }
//
//   private scheduleReconnect(): void {
//     this.reconnectAttempts++;
//     const delay = this.reconnectInterval * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5));
//
//     setTimeout(() => {
//       if (!this.isConnected && !this.isConnecting) {
//         this.emit('reconnecting', this.reconnectAttempts);
//         this.connect().catch(() => {
//           // Reconnection failed, will try again if attempts remain
//         });
//       }
//     }, delay);
//   }
//
//   private authenticate(): void {
//     if (!this.authToken || !this.isConnected) {
//       return;
//     }
//
//     const authMessage = {
//       type: 'auth',
//       token: this.authToken,
//       timestamp: Date.now(),
//     };
//
//     this.send(authMessage);
//   }
//
//   private startPing(): void {
//     this.pingTimer = setInterval(() => {
//       if (this.isConnected) {
//         this.send({ type: 'ping', timestamp: Date.now() });
//       }
//     }, this.pingInterval);
//   }
//
//   private stopPing(): void {
//     if (this.pingTimer) {
//       clearInterval(this.pingTimer);
//       this.pingTimer = undefined;
//     }
//   }
//
//   private handleMessage(data: string): void {
//     try {
//       const message: WebSocketMessage = JSON.parse(data);
//
//       switch (message.type) {
//         case 'auth_success':
//           this.emit('authenticated');
//           // Re-subscribe to previous subscriptions
//           this.resubscribe();
//           break;
//
//         case 'auth_error':
//           this.emit('auth_error', message.data);
//           break;
//
//         case 'pong':
//           // Handle pong response
//           break;
//
//         case 'ticker':
//           this.emit('ticker', message.data as Ticker);
//           break;
//
//         case 'quote':
//           this.emit('quote', message.data as Quote);
//           break;
//
//         case 'order_update':
//           this.emit('order', message.data as Order);
//           break;
//
//         case 'portfolio_update':
//           this.emit('portfolio', message.data as Portfolio);
//           break;
//
//         case 'error':
//           this.emit('error', new Error(message.data?.message || 'WebSocket error'));
//           break;
//
//         default:
//           this.emit('message', message);
//       }
//     } catch (error) {
//       this.emit('error', new Error('Failed to parse WebSocket message'));
//     }
//   }
//
//   private send(data: any): void {
//     if (this.ws && this.isConnected) {
//       this.ws.send(JSON.stringify(data));
//     }
//   }
//
//   // Subscription methods
//   subscribe(channels: string[], symbols?: string[]): void {
//     const request: SubscriptionRequest = {
//       type: 'subscribe',
//       channels,
//       symbols,
//     };
//
//     // Store subscription for reconnection
//     const subscriptionKey = `${channels.join(',')}:${symbols?.join(',') || 'all'}`;
//     this.subscriptions.add(subscriptionKey);
//
//     this.send(request);
//   }
//
//   unsubscribe(channels: string[], symbols?: string[]): void {
//     const request: SubscriptionRequest = {
//       type: 'unsubscribe',
//       channels,
//       symbols,
//     };
//
//     // Remove from stored subscriptions
//     const subscriptionKey = `${channels.join(',')}:${symbols?.join(',') || 'all'}`;
//     this.subscriptions.delete(subscriptionKey);
//
//     this.send(request);
//   }
//
//   private resubscribe(): void {
//     for (const subscription of this.subscriptions) {
//       const [channelsPart, symbolsPart] = subscription.split(':');
//       const channels = channelsPart.split(',');
//       const symbols = symbolsPart === 'all' ? undefined : symbolsPart.split(',');
//
//       const request: SubscriptionRequest = {
//         type: 'subscribe',
//         channels,
//         symbols,
//       };
//
//       this.send(request);
//     }
//   }
//
//   // Convenience methods for common subscriptions
//   subscribeToTickers(symbols?: string[]): void {
//     this.subscribe(['ticker'], symbols);
//   }
//
//   subscribeToQuotes(symbols?: string[]): void {
//     this.subscribe(['quote'], symbols);
//   }
//
//   subscribeToOrders(): void {
//     this.subscribe(['orders']);
//   }
//
//   subscribeToPortfolio(): void {
//     this.subscribe(['portfolio']);
//   }
//
//   // Status methods
//   isWebSocketConnected(): boolean {
//     return this.isConnected;
//   }
//
//   getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
//     if (this.isConnected) return 'connected';
//     if (this.isConnecting) return 'connecting';
//     return 'disconnected';
//   }
// }
