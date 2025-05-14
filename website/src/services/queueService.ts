import { debounce } from 'lodash';

interface QueueItem {
  type: 'restaurant' | 'comment';
  action: 'add' | 'update' | 'delete';
  id?: string;
  data?: unknown;
  timestamp: number;
}

type DebouncedFn = {
  (): void;
  cancel: () => void;
  flush: () => void;
};

class UpdateQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private flushDebounced: DebouncedFn;

  constructor(flushInterval = 3000) {
    this.flushDebounced = debounce(this.flush.bind(this), flushInterval) as DebouncedFn;
  }

  enqueue(item: Omit<QueueItem, 'timestamp'>) {
    const queueItem: QueueItem = {
      ...item,
      timestamp: Date.now()
    };

    const existingIndex = this.queue.findIndex(
      i => i.type === item.type && i.id === item.id && i.action === item.action
    );

    if (existingIndex >= 0) {
      this.queue[existingIndex] = queueItem;
    } else {
      this.queue.push(queueItem);
    }

    this.flushDebounced();
    return queueItem;
  }

  private async flush() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const currentQueue = [...this.queue];
    this.queue = [];

    try {
      for (const item of currentQueue) {
        switch (item.type) {
          case 'restaurant':
            await this.processRestaurantItem(item);
            break;
          case 'comment':
            await this.processCommentItem(item);
            break;
        }
      }
    } catch (error) {
      console.error('Error processing update queue:', error);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        this.flushDebounced();
      }
    }
  }

  private getAuthHeader() {
    return {
      "Content-Type": "application/json",
    };
  }

  private async processRestaurantItem(item: QueueItem) {
    const { action, id, data } = item;
    const headers = this.getAuthHeader();

    switch (action) {
      case 'add':
        await fetch("/api/restaurants", {
          method: "POST",
          headers,
          body: JSON.stringify(data),
          credentials: "include",
        });
        break;

      case 'update':
        if (!id) throw new Error('ID is required for update');
        await fetch(`/api/restaurants/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
          credentials: "include",
        });
        break;

      case 'delete':
        if (!id) throw new Error('ID is required for delete');
        await fetch(`/api/restaurants/${id}`, {
          method: "DELETE",
          headers,
          credentials: "include",
        });
        break;
    }
  }

  private async processCommentItem(item: QueueItem) {
    const { action, id, data } = item;
    const headers = this.getAuthHeader();

    switch (action) {
      case 'add':
        await fetch("/api/comments", {
          method: "POST",
          headers,
          body: JSON.stringify(data),
          credentials: "include",
        });
        break;

      case 'update':
        if (!id) throw new Error('ID is required for update');
        await fetch(`/api/comments/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(data),
          credentials: "include",
        });
        break;

      case 'delete':
        if (!id) throw new Error('ID is required for delete');
        await fetch(`/api/comments/${id}`, {
          method: "DELETE",
          headers,
          credentials: "include",
        });
        break;
    }
  }

  forceFlush() {
    this.flushDebounced.cancel();
    return this.flush();
  }

  getPendingCount() {
    return this.queue.length;
  }
}

export const updateQueue = new UpdateQueue();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (updateQueue.getPendingCount() > 0) {
      updateQueue.forceFlush();
    }
  });
}
