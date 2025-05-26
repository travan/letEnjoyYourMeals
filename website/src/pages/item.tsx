/* eslint-disable react-hooks/rules-of-hooks */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  MapPin,
  Star,
  Clock,
  Tag,
  Heart,
  Share2,
  MessageCircle,
  ArrowLeft,
  X,
  ChevronRight,
  Upload,
} from "lucide-react";
import * as Ionicons from "react-icons/io5";
import toast from "react-hot-toast";

// Components
import MapView from "../components/MapComponents";
import ImageSlider from "../components/SlideImages";
import CommentModal from "../components/CommentModal";

// Store
import { useRestaurantsList } from "../store/restaurantStore";
import { useCommentsList, useCommentStore } from "../store/commentStore";
import { useCategoryStore } from "../store/categoryStore";
import { Comment, Restaurant } from "@shared/data/index";
import { useUploadImageStore } from "../store/uploadImageStore";

interface Hours {
  open: string;
  close: string;
}

interface OperatingHours {
  [day: string]: Hours;
}

interface Contact {
  phone?: string;
  website?: string;
}

interface RestaurantHeaderProps {
  name: string;
  onBack: () => void;
}

interface RestaurantInfoProps {
  restaurant: Restaurant;
  rating: string;
  category: {
    icon: React.ComponentType<{ size: number }>;
    name: string;
  } | null;
}

interface LocationSectionProps {
  restaurant: Restaurant;
  showMap: boolean;
  onToggleMap: () => void;
}

interface ContactSectionProps {
  contact?: Contact;
}

interface HoursSectionProps {
  hours?: OperatingHours;
}

interface FeaturesSectionProps {
  features?: string[];
}

interface ActionButtonsProps {
  commentsCount: number;
  uploading: boolean;
  onShowComments: () => void;
  onShare: () => Promise<void>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FullImageModalProps {
  image: string;
  onClose: () => void;
}

// Smaller component for restaurant header
const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  name,
  onBack,
}) => (
  <div className="flex items-center mb-4">
    <button onClick={onBack} className="p-2">
      <ArrowLeft />
    </button>
    <h1 className="ml-4 text-xl font-bold">{name}</h1>
  </div>
);

// Restaurant info section
const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  restaurant,
  rating,
  category,
}) => {
  const CategoryIcon = category?.icon;

  return (
    <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
      <div className="flex items-center gap-1">
        <Clock size={16} /> {restaurant.time}
      </div>
      <div className="flex items-center gap-1">
        <Star size={16} className="text-yellow-500" /> {rating}
      </div>
      <div className="flex items-center gap-1">
        <Tag size={16} /> {restaurant.price}
      </div>
      {category && CategoryIcon && (
        <div className="flex items-center gap-1">
          <CategoryIcon size={16} /> {category.name}
        </div>
      )}
    </div>
  );
};

// Location and map section
const LocationSection: React.FC<LocationSectionProps> = ({
  restaurant,
  showMap,
  onToggleMap,
}) => (
  <>
    <button
      className="flex items-center gap-2 text-blue-600 hover:underline"
      onClick={onToggleMap}
    >
      <MapPin size={20} /> {restaurant.location || "Location not specified"}
      <ChevronRight size={20} />
    </button>

    {showMap && restaurant.coordinates && (
      <MapView
        latitude={restaurant.coordinates.latitude}
        longitude={restaurant.coordinates.longitude}
      />
    )}
  </>
);

// Contact information section
const ContactSection: React.FC<ContactSectionProps> = ({ contact }) => (
  <>
    {contact?.phone && (
      <div>
        <h3 className="font-medium text-gray-800">Phone</h3>
        <p className="text-gray-600">{contact.phone}</p>
      </div>
    )}
    {contact?.website && (
      <div>
        <h3 className="font-medium text-gray-800">Website</h3>
        <a
          href={contact.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {contact.website}
        </a>
      </div>
    )}
  </>
);

// Hours section
const HoursSection: React.FC<HoursSectionProps> = ({ hours }) =>
  hours ? (
    <div>
      <h3 className="font-medium text-gray-800 mb-2">Opening Hours</h3>
      <ul className="text-gray-600 text-sm space-y-1">
        {Object.entries(hours).map(([day, hours]) => (
          <li key={day} className="flex justify-between">
            <span className="capitalize">{day}</span>
            <span>
              {hours.open} - {hours.close}
            </span>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

// Features/tags section
const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) =>
  features && features.length > 0 ? (
    <div>
      <h3 className="font-medium text-gray-800">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {features.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-200 px-2 py-1 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  ) : null;

// Action buttons section
const ActionButtons: React.FC<ActionButtonsProps> = ({
  commentsCount,
  uploading,
  onShowComments,
  onShare,
  onImageUpload,
}) => (
  <div className="flex justify-between items-center mt-6 border-t pt-4 gap-4 text-sm text-gray-700">
    <button className="flex items-center gap-1" onClick={onShowComments}>
      <MessageCircle size={20} /> {commentsCount}
    </button>
    <button className="flex items-center gap-1">
      <Heart size={20} /> Like
    </button>
    <button className="flex items-center gap-1" onClick={onShare}>
      <Share2 size={20} /> Share
    </button>
    <label
      className={`flex items-center gap-1 cursor-pointer transition-opacity ${
        uploading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <Upload size={20} />
      Upload
      <input
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
        disabled={uploading}
      />
    </label>
  </div>
);

// Full image modal
const FullImageModal: React.FC<FullImageModalProps> = ({ image, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black flex flex-col">
    <button className="p-4 self-end text-white" onClick={onClose}>
      <X size={28} />
    </button>
    <img src={image} alt="Full" className="object-contain flex-1" />
  </div>
);

// Main component
const RestaurantItem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const restaurants = useRestaurantsList();
  const commentsByRestaurant = useCommentsList(id!);

  const fetchComments = useCommentStore((state) => state.fetchComments);
  const postComment = useCommentStore((state) => state.postComment);
  const { categories } = useCategoryStore();

  const { uploadImage, uploading } = useUploadImageStore();

  // All hooks at the top
  const [showFullImage, setShowFullImage] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);

  // Find restaurant and comments safely with proper null checking
  const restaurant = useMemo(() => {
    return id ? restaurants.find((r) => r.id === id) : undefined;
  }, [restaurants, id]);

  const comments = useMemo(() => {
    return id && commentsByRestaurant ? commentsByRestaurant : [];
  }, [commentsByRestaurant, id]);

  if (!restaurant || !id) {
    return <div className="p-4">Not found any restaurant.</div>;
  }

  useEffect(() => {
    if (id) {
      fetchComments(id);
    }
  }, [fetchComments, id]);

  const rating = useMemo(() => {
    const total = comments.reduce((acc, comment) => acc + comment.rating, 0);
    if (comments.length === 0) return restaurant.rating.toFixed(1);
    const averageRating = (total + restaurant.rating) / (comments.length + 1);
    return averageRating.toFixed(1);
  }, [comments, restaurant.rating]);

  const category = useMemo(() => {
    const cat = categories.find((c) => c.id === restaurant.category);
    if (!cat) return null;

    const iconName = cat.icon
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");

    const Icon = Ionicons[`Io${iconName}` as keyof typeof Ionicons];
    return Icon ? { icon: Icon, name: cat.name } : null;
  }, [categories, restaurant.category]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleMapToggle = useCallback(() => {
    setShowMap((prev) => !prev);
  }, []);

  const handleShare = useCallback(async (): Promise<void> => {
    if (!restaurant.coordinates) return;

    const shareText = `${restaurant.name} - ${restaurant.location}\nLocation: https://maps.google.com/?q=${restaurant.coordinates.latitude},${restaurant.coordinates.longitude}`;

    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Location copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  }, [restaurant]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 20) {
        toast.error("Image size exceeds the maximum limit (20MB).");
        return;
      }

      if (fileSizeMB > 5) {
        toast(
          "We recommend uploading images under 5MB for better performance."
        );
      }

      const toastId = toast.loading("Uploading image...");
      try {
        await uploadImage(file, restaurant.id);
        toast.success("Upload successful!", { id: toastId });
      } catch (error) {
        console.error("Failed to upload image:", error);
        toast.error("Upload failed. Please try again.", { id: toastId });
      }
    },
    [restaurant, uploadImage]
  );

  const handleShowComments = useCallback(() => {
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback(() => {
    setShowComments(false);
  }, []);

  const handleCloseFullImage = useCallback(() => {
    setShowFullImage(false);
  }, []);

  const commentSetter = useCallback(
    (value: React.SetStateAction<Comment[]>) => {
      const newComments = typeof value === "function" ? value(comments) : value;
      postComment(newComments[0]);
    },
    [comments, postComment]
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <RestaurantHeader name={restaurant.name} onBack={handleBack} />

      <ImageSlider images={restaurant.image} />

      <div className="space-y-4 mt-4">
        <RestaurantInfo
          restaurant={restaurant}
          rating={rating}
          category={category}
        />

        {restaurant.description && (
          <p className="text-gray-700">{restaurant.description}</p>
        )}

        <LocationSection
          restaurant={restaurant}
          showMap={showMap}
          onToggleMap={handleMapToggle}
        />

        <ContactSection contact={restaurant.contact} />

        <HoursSection hours={restaurant.operatingHours} />

        <FeaturesSection features={restaurant.features} />
      </div>

      <ActionButtons
        commentsCount={comments.length}
        uploading={uploading}
        onShowComments={handleShowComments}
        onShare={handleShare}
        onImageUpload={handleImageUpload}
      />

      {showFullImage && restaurant.image.length > 0 && (
        <FullImageModal
          image={restaurant.image[0]}
          onClose={handleCloseFullImage}
        />
      )}

      {showComments && (
        <CommentModal
          restaurantId={restaurant.id}
          comments={comments}
          setComments={commentSetter}
          onClose={handleCloseComments}
        />
      )}
    </div>
  );
};

export default RestaurantItem;
