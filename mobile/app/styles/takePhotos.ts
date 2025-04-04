import { StyleSheet, Platform } from 'react-native';

export const takePhotosStyles = {
  // Container styles
  container: 'flex-1 bg-black',

  // Header styles
  header: 'absolute top-0 left-0 right-0 flex-row justify-between items-center p-4 pt-5 z-10',
  headerButton: 'w-10 h-10 rounded-full bg-white/20 justify-center items-center',

  // Camera styles
  camera: 'flex-1',

  // Controls styles
  controls: 'absolute bottom-0 left-0 right-0 flex-row justify-around items-center p-4 pb-8 bg-black/50',

  // Capture button styles
  captureButton: 'w-16 h-16 rounded-full bg-white justify-center items-center',
  captureButtonInner: 'w-14 h-14 rounded-full bg-white border-2 border-black',

  // Gallery and flash button styles
  galleryButton: 'w-12 h-12 rounded-full bg-white/20 justify-center items-center',
  flashButton: 'w-12 h-12 rounded-full bg-white/20 justify-center items-center',

  // Preview styles
  previewContainer: 'flex-1 bg-black',
  previewImage: 'absolute inset-0 object-cover',
  previewActions: 'absolute bottom-0 left-0 right-0 flex-row justify-around p-4 pb-8 bg-black/50',
  previewButton: 'items-center',
  previewButtonText: 'text-white mt-1 text-sm',

  // Form styles
  formContainer: 'flex-1 bg-black/70 p-4',
  formScroll: 'flex-1',
  formGroup: 'mb-4',
  label: 'text-white text-base font-semibold mb-2',
  input: 'bg-white rounded-lg p-3 text-base text-gray-900',
  textArea: 'h-24 text-top',
  disabledButton: 'opacity-50',

  // Modal styles
  modalOverlay: 'flex-1 bg-black/50 justify-end',
  modalContent: 'bg-white rounded-t-2xl p-5 max-h-4/5',
  modalHeader: 'flex-row justify-between items-center mb-5',
  modalTitle: 'text-xl font-semibold text-gray-900',
  categoryList: 'max-h-4/5',
  categoryItem: 'flex-row items-center py-3 px-4 rounded-lg mb-2',
  selectedCategory: 'bg-blue-50',
  categoryIconContainer: 'w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3',
  categoryText: 'text-base text-gray-600',
  selectedCategoryText: 'text-blue-500 font-semibold',
  categorySelector: 'flex-row items-center justify-between bg-white rounded-lg p-3 mb-4',
  categorySelectorContent: 'flex-row items-center',
  categorySelectorText: 'ml-2 text-base text-gray-600',
}; 