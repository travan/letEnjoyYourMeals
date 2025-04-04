import { StyleSheet, Platform, Dimensions } from 'react-native';

export const photoDetails = {
  // Container and Layout
  container: 'flex-1 bg-white',
  loadingContainer: 'flex-1 justify-center items-center bg-white',
  mainContent: 'flex-1',
  content: 'flex-1',
  
  // Header
  header: 'flex-row items-center p-4 border-b border-gray-200 pt-4',
  backButton: 'p-2',
  headerTitle: 'text-xl font-semibold ml-4 text-gray-900',
  
  // Photo
  photo: 'w-full h-72',
  detailsContainer: 'p-4',
  title: 'text-2xl font-bold text-gray-900 mb-4',
  
  // Info Rows
  infoRow: 'flex-row items-center mb-4',
  infoItem: 'flex-row items-center mr-6',
  infoText: 'ml-2 text-base text-gray-600',
  
  // Location
  locationContainer: 'flex-row items-center mb-6 bg-gray-50 p-3 rounded-lg',
  locationText: 'flex-1 ml-2 text-base text-gray-600',
  locationArrow: 'ml-2',
  
  // Map
  mapSection: 'border-t border-gray-200 bg-white',
  mapHeader: 'flex-row items-center justify-between p-4 border-b border-gray-200',
  mapTitle: 'text-lg font-semibold text-gray-900',
  closeMapButton: 'p-2',
  map: 'w-full h-full',
  openMapsButton: 'flex-row items-center justify-center bg-blue-500 rounded-lg p-3 mt-4',
  openMapsText: 'text-white ml-2 font-semibold',
  
  // Actions
  actionsContainer: 'flex-row justify-around border-t border-gray-200 py-4 bg-white absolute bottom-0 left-0 right-0 z-10',
  actionButton: 'items-center',
  actionText: 'mt-1 text-sm text-gray-600',
  
  // Modal
  modalContainer: 'flex-1 bg-black/90 justify-center items-center',
  closeButton: 'absolute right-4 z-10 p-2',
  fullImage: 'w-full h-full',
  
  // Comments
  commentsSection: 'mt-4',
  commentInput: 'flex-row items-center mb-4',
  input: 'flex-1 bg-gray-50 rounded-full px-4 py-2 mr-2',
  sendButton: 'p-2',
  comment: 'flex-row mb-4 p-2',
  avatar: 'w-10 h-10 rounded-full mr-3',
  commentContent: 'flex-1',
  commentHeader: 'flex-row justify-between items-center mb-1',
  userName: 'text-sm font-semibold text-gray-900',
  timestamp: 'text-xs text-gray-500',
  commentText: 'text-sm text-gray-700 mb-1',
  likeButton: 'flex-row items-center',
  likeCount: 'ml-1 text-xs text-gray-500',
  
  // Description
  descriptionContainer: 'mt-4 p-4 bg-gray-50 rounded-lg',
  descriptionText: 'text-base text-gray-600 leading-6',
  
  // Info Sections
  infoSection: 'mt-4 p-4 bg-gray-50 rounded-lg',
  sectionTitle: 'text-base font-semibold text-gray-900 mb-2',
  sectionText: 'text-base text-gray-600 leading-6',
  linkText: 'text-blue-500 underline',
  
  // Features
  featuresContainer: 'flex-row flex-wrap mt-2',
  featureItem: 'flex-row items-center mr-4 mb-2',
  featureText: 'ml-1 text-sm text-gray-600',
  
  // Tags
  tagsContainer: 'flex-row flex-wrap mt-2',
  tagItem: 'bg-gray-200 px-3 py-1.5 rounded-full mr-2 mb-2',
  tagText: 'text-sm text-gray-600',
  
  // Category Description
  categoryDescriptionContainer: 'mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500',
  categoryDescriptionText: 'text-sm text-gray-600 leading-5 italic',
  
  // Comments Modal
  modalOverlay: 'flex-1 bg-black/50 justify-end',
  commentsModal: 'bg-white rounded-t-2xl p-4 h-[80%]',
  modalHeader: 'flex-row justify-between items-center mb-4',
  modalTitle: 'text-lg font-semibold text-gray-900',
  commentsList: 'flex-1 mb-4',
  commentInputContainer: 'flex-row items-center mb-4 pt-4 border-t border-gray-200',
  modalCommentInput: 'flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2',
  modalSendButton: 'p-2',
  modalContent: 'bg-white rounded-t-2xl p-4 h-[90%]',
  mapContainer: 'h-[90%] rounded-lg overflow-hidden',
}; 