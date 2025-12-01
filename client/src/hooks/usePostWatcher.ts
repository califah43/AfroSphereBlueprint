import { useEffect } from 'react';

interface PostUpdate {
  type: string;
  postId: string;
  likes: number;
}

export function usePostWatcher(postId: string, onUpdate: (data: PostUpdate) => void) {
  useEffect(() => {
    if (!postId) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/api/posts/watch`);

        ws.onopen = () => {
          ws?.send(JSON.stringify({ action: 'subscribe', postId }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as PostUpdate;
            if (data.postId === postId) {
              onUpdate(data);
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (e) {
        console.error('WebSocket connection failed:', e);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [postId, onUpdate]);
}
