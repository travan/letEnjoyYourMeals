import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Comment } from "../../../shared/data/index";

interface CommentModalProps {
  restaurantId: string;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  onClose: () => void;
}

const StarRating = ({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (value: number) => void;
}) => {
  const handleClick = (value: number) => {
    onRate(rating === value ? 0 : value);
  };

  return (
    <div className="flex space-x-1 cursor-pointer text-yellow-500">
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const isFull = rating >= starValue;
        const isHalf = rating >= starValue - 0.5 && rating < starValue;

        return (
          <span key={i} onClick={() => handleClick(starValue)}>
            {isFull ? "★" : isHalf ? "☆" : "☆"}
          </span>
        );
      })}
    </div>
  );
};

export default function CommentModal({
  restaurantId,
  comments,
  setComments,
  onClose,
}: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [rating, setRating] = useState(0);

  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: "Anonymous",
      restaurantId,
      rating: rating || 0,
      text: newComment,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComments([comment, ...comments]);
    setNewComment("");
    setRating(0);
    onClose();
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold mb-4">Comments</h3>

        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800">
                  {comment.userId}
                </p>
                {comment.rating > 0 && (
                  <span className="text-yellow-500 text-sm">
                    {comment.rating.toFixed(1)} ★
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{comment.text}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-2 relative">
          <StarRating rating={rating} onRate={setRating} />

          <div className="relative w-full">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 pr-10 border rounded-md text-sm resize-none"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 bottom-2 text-gray-500 hover:text-black"
              title="Add emoji"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div ref={emojiRef} className="z-10 absolute bottom-14 left-0">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>

          <button
            onClick={handleAddComment}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
