import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { photoDetails } from "../styles/photoDetails";
import { Comment } from "@shared/data/index";

export const CommentModal = ({
  visible,
  onClose,
  listComments,
  restaurantId,
}: {
  visible: boolean;
  onClose: () => void;
  listComments: Comment[];
  restaurantId: string;
}) => {
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        userId: "currentUser",
        restaurantId: restaurantId as string,
        rating: rating,
        text: newComment.trim(),
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      listComments.unshift(comment);
      setNewComment("");
      setRating(0);
      onClose();
    }
  };

  const handleLikeComment = (commentId: string) => {
    listComments.map((comment) =>
      comment.id === commentId
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className={photoDetails.modalOverlay}>
        <View className={photoDetails.commentsModal}>
          <View className={photoDetails.modalHeader}>
            <Text className={photoDetails.modalTitle}>Comments</Text>
            <TouchableOpacity
              className={photoDetails.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className={photoDetails.commentsList}>
            {listComments.map((comment) => (
              <View key={comment.id} className={photoDetails.comment}>
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/men/5.jpg",
                  }}
                  className={photoDetails.avatar}
                />
                <View className={photoDetails.commentContent}>
                  <View className={photoDetails.commentHeader}>
                    <Text className={photoDetails.userName}>
                      User {comment.userId}
                    </Text>
                    <Text className={photoDetails.timestamp}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View className="flex-row mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < comment.rating ? "star" : "star-outline"}
                        size={16}
                        color="#FBBF24"
                      />
                    ))}
                  </View>

                  <Text className={photoDetails.commentText}>
                    {comment.text}
                  </Text>

                  <TouchableOpacity
                    className={photoDetails.likeButton}
                    onPress={() => handleLikeComment(comment.id)}
                  >
                    <Ionicons name="heart-outline" size={16} color="#6B7280" />
                    <Text className={photoDetails.likeCount}>
                      {comment.likes}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className={photoDetails.commentInputContainer}>
            {/* Rating stars input */}
            <View className="flex-row items-center mb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setRating(index + 1)}
                  className="mr-1"
                >
                  <Ionicons
                    name={index < rating ? "star" : "star-outline"}
                    size={20}
                    color="#FBBF24"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment input and send button */}
            <View className="flex-row items-center">
              <TextInput
                className={photoDetails.modalCommentInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity
                className={photoDetails.modalSendButton}
                onPress={handleAddComment}
              >
                <Ionicons name="send" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
