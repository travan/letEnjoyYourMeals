import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  // Container styles - flex-1 bg-white
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Header styles - p-4 border-b border-gray-200
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    position: 'relative',
  },

  // Header top section - flex-row items-center justify-between mb-3
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Header title - text-2xl font-bold text-gray-900
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  // Header buttons container - flex-row items-center
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Header button - p-2 ml-2
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Search container - flex-row items-center bg-gray-100 rounded-lg px-3 h-10
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Search icon - mr-2
  searchIcon: {
    marginRight: 12,
  },

  // Search input - flex-1 text-base text-gray-900
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
    paddingVertical: 8,
  },

  // Clear button - p-1
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Content container - flex-1
  content: {
    flex: 1,
  },

  // Categories container - py-4 border-b border-gray-200
  categoriesContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  // Category item - items-center mx-4
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },

  // Category icon - w-14 h-14 rounded-full bg-blue-50 justify-center items-center mb-2
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Category text - text-sm text-gray-600
  categoryText: {
    fontSize: 14,
    color: '#4b5563',
  },

  // Section container - p-4
  section: {
    padding: 16,
  },

  // Section title - text-xl font-semibold text-gray-900 mb-4
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },

  // Restaurants grid - flex-row flex-wrap -mx-2
  restaurantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },

  // Restaurant card - w-full mb-4 bg-white rounded-xl shadow-md
  restaurantCard: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Restaurant image - w-full h-48 rounded-t-xl
  restaurantImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  // Restaurant info - p-4
  restaurantInfo: {
    padding: 16,
  },

  // Restaurant name - text-lg font-semibold text-gray-900 mb-2
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },

  // Restaurant details - flex-row items-center mb-2
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Detail item - flex-row items-center mr-4
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },

  // Detail text - ml-1 text-sm text-gray-500
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },

  // Location container - flex-row items-center bg-gray-100 p-2 rounded-md
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 6,
  },

  // Location text - ml-1 text-sm text-gray-500
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },

  // Photo preview - absolute inset-0 bg-black justify-center items-center
  photoPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Preview image - w-full h-full object-contain
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  // Photo actions - absolute bottom-0 left-0 right-0 flex-row justify-around p-4 bg-black/50
  photoActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Action button - items-center
  actionButton: {
    alignItems: 'center',
  },

  // Action text - text-white mt-1 text-sm
  actionText: {
    color: '#ffffff',
    marginTop: 4,
    fontSize: 14,
  },

  // Highlighted card - border-2 border-yellow-400 bg-yellow-50
  highlightedCard: {
    borderWidth: 2,
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },

  // Restaurant header - flex-row justify-between items-center px-3 pt-2
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },

  // Highlight button - p-1
  highlightButton: {
    padding: 4,
  },

  // Restaurant card variants
  restaurantCardCompact: {
    flexDirection: 'row',
    height: 100,
    marginBottom: 12,
  },
  restaurantCardDetailed: {
    marginBottom: 24,
  },

  // Restaurant image variants
  restaurantImageCompact: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  restaurantImageDetailed: {
    height: 240,
  },

  // Restaurant info variants
  restaurantInfoCompact: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  restaurantInfoDetailed: {
    padding: 16,
  },

  // Restaurant name variants
  restaurantNameCompact: {
    fontSize: 16,
    marginBottom: 4,
  },
  restaurantNameDetailed: {
    fontSize: 24,
    marginBottom: 8,
  },

  // Restaurant description
  restaurantDescription: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },

  cancelButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  permissionText: {
    marginBottom: 16,
  },

  permissionButton: {
    padding: 16,
    backgroundColor: '#000',
    borderRadius: 8,
  },

  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 