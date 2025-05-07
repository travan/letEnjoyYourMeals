import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { Comment } from "../../../shared/data/index";
import { updateQueue } from "../services/queueService";

interface CommentState {
  comments: Record<string, Comment>;
  commentIdsByRestaurant: Record<string, string[]>;
  isLoading: boolean;
  error: string | null;
  fetched: Record<string, boolean>;
  pendingChanges: number;
}

interface CommentActions {
  // State modifiers
  setComments: (restaurantId: string, comments: Comment[]) => void;
  addCommentToStore: (comment: Comment) => void;
  updateCommentInStore: (id: string, data: Partial<Comment>) => void;
  deleteCommentFromStore: (id: string, restaurantId: string) => void;

  // Queue actions
  postComment: (comment: Comment) => void;
  putComment: (id: string, data: Partial<Comment>) => void;
  removeComment: (id: string, restaurantId: string) => void;

  // Direct API actions
  fetchComments: (restaurantId: string) => Promise<void>;
  forceSyncChanges: () => Promise<void>;

  // Track pending changes
  incrementPendingChanges: () => void;
  decrementPendingChanges: () => void;
}

type CommentStore = CommentState & CommentActions;

// Helper function
const normalizeComments = (
  comments: Comment[]
): {
  byId: Record<string, Comment>;
  ids: string[];
} => {
  const byId: Record<string, Comment> = {};
  const ids: string[] = [];

  comments.forEach((comment) => {
    byId[comment.id] = comment;
    ids.push(comment.id);
  });

  return { byId, ids };
};

export const useCommentStore = create<CommentStore>()(
  devtools(
    immer((set, get) => ({
      comments: {},
      commentIdsByRestaurant: {},
      isLoading: false,
      error: null,
      fetched: {},
      pendingChanges: 0,

      setComments: (restaurantId, comments) => {
        const { byId, ids } = normalizeComments(comments);

        set((state) => {
          Object.assign(state.comments, byId);

          state.commentIdsByRestaurant[restaurantId] = ids;

          state.fetched[restaurantId] = true;
        });
      },

      addCommentToStore: (comment) => {
        set((state) => {
          // Thêm comment vào object chính
          state.comments[comment.id] = comment;

          // Thêm ID vào đầu danh sách của restaurant
          const restaurantId = comment.restaurantId;
          if (!state.commentIdsByRestaurant[restaurantId]) {
            state.commentIdsByRestaurant[restaurantId] = [];
          }
          state.commentIdsByRestaurant[restaurantId].unshift(comment.id);
        });
      },

      updateCommentInStore: (id, data) => {
        set((state) => {
          if (state.comments[id]) {
            state.comments[id] = { ...state.comments[id], ...data };
          }
        });
      },

      deleteCommentFromStore: (id, restaurantId) => {
        set((state) => {
          if (state.comments[id]) {
            delete state.comments[id];
          }

          if (state.commentIdsByRestaurant[restaurantId]) {
            state.commentIdsByRestaurant[restaurantId] =
              state.commentIdsByRestaurant[restaurantId].filter(
                (commentId) => commentId !== id
              );
          }
        });
      },

      // QUEUE ACTIONS
      postComment: (comment) => {
        get().addCommentToStore(comment);

        updateQueue.enqueue({
          type: "comment",
          action: "add",
          data: [comment],
        });

        get().incrementPendingChanges();
      },

      putComment: (id, data) => {
        get().updateCommentInStore(id, data);

        updateQueue.enqueue({
          type: "comment",
          action: "update",
          id,
          data,
        });

        get().incrementPendingChanges();
      },

      removeComment: (id, restaurantId) => {
        get().deleteCommentFromStore(id, restaurantId);

        updateQueue.enqueue({
          type: "comment",
          action: "delete",
          id,
        });

        get().incrementPendingChanges();
      },

      fetchComments: async (restaurantId) => {
        const { fetched } = get();
        if (fetched[restaurantId]) return;

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const res = await fetch(`/api/comments?restaurantId=${restaurantId}`);
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);

          const data = await res.json();
          get().setComments(restaurantId, data);
        } catch (err) {
          console.error("Failed to fetch comments", err);
          set((state) => {
            state.error = err instanceof Error ? err.message : "Unknown error";
          });
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },

      forceSyncChanges: async () => {
        await updateQueue.forceFlush();
        set((state) => {
          state.pendingChanges = 0;
        });
      },

      incrementPendingChanges: () => {
        set((state) => {
          state.pendingChanges += 1;
        });
      },

      decrementPendingChanges: () => {
        set((state) => {
          state.pendingChanges = Math.max(0, state.pendingChanges - 1);
        });
      },
    })),
    { name: "comment-store" }
  )
);

export const useCommentsList = (restaurantId: string) => {
  const comments = useCommentStore((state) => state.comments);
  const commentIds = useCommentStore(
    (state) => state.commentIdsByRestaurant[restaurantId]
  );

  // Nếu restaurantId không có comment, trả về mảng trống
  if (!commentIds) return [];

  // Lọc các comment bằng các ID lấy từ commentIdsByRestaurant
  return commentIds.map((id) => comments[id]);
};
