import { create } from "zustand";
import { Comment } from "../../../shared/data/index";

interface CommentState {
  commentsByRestaurant: Record<string, Comment[]>;
  fetched: Record<string, boolean>; // track fetched per restaurant
  setComments: (restaurantId: string, comments: Comment[]) => void;
  addCommentToStore: (comment: Comment) => void;
  updateCommentInStore: (id: string, restaurantId: string, data: Partial<Comment>) => void;
  deleteCommentFromStore: (id: string, restaurantId: string) => void;

  fetchComments: (restaurantId: string) => Promise<void>;
  postComment: (comments: Comment[]) => Promise<void>;
  putComment: (id: string, data: Partial<Comment>) => Promise<void>;
  removeComment: (id: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  commentsByRestaurant: {},
  fetched: {},

  setComments: (restaurantId, comments) =>
    set((state) => ({
      commentsByRestaurant: { ...state.commentsByRestaurant, [restaurantId]: comments },
    })),

  addCommentToStore: (comment) =>
    set((state) => ({
      commentsByRestaurant: {
        ...state.commentsByRestaurant,
        [comment.restaurantId]: [
          comment,
          ...(state.commentsByRestaurant[comment.restaurantId] || []),
        ],
      },
    })),

  updateCommentInStore: (id, restaurantId, data) =>
    set((state) => ({
      commentsByRestaurant: {
        ...state.commentsByRestaurant,
        [restaurantId]: state.commentsByRestaurant[restaurantId]?.map((comment) =>
          comment.id === id ? { ...comment, ...data } : comment
        ),
      },
    })),

  deleteCommentFromStore: (id, restaurantId) =>
    set((state) => ({
      commentsByRestaurant: {
        ...state.commentsByRestaurant,
        [restaurantId]: state.commentsByRestaurant[restaurantId]?.filter(
          (comment) => comment.id !== id
        ),
      },
    })),

  fetchComments: async (restaurantId) => {
    const { fetched } = get();
    if (fetched[restaurantId]) return;

    try {
      const res = await fetch(`/api/comments?restaurantId=${restaurantId}`);
      const data = await res.json();
      set((state) => ({
        commentsByRestaurant: {
          ...state.commentsByRestaurant,
          [restaurantId]: data,
        },
        fetched: { ...state.fetched, [restaurantId]: true },
      }));
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  },

  postComment: async (comments) => {
    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comments),
      });
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  },

  putComment: async (id, data) => {
    try {
      await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  },

  removeComment: async (id) => {
    try {
      await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  },
}));
