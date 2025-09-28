import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order } from '@/types';

export function useOrderTracking(orderNumber: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
    });
    
    newSocket.on('connect', () => {
      newSocket.emit('track_order', { order_number: orderNumber });
    });
    
    newSocket.on('order_update', (data) => {
      setOrder(data.order);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [orderNumber]);
  
  return { order, isConnected: socket?.connected };
}