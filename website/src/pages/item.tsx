import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import MapView from "../components/MapComponents";
import {
  categories
} from "../../../shared/data/index";
import * as Ionicons from "react-icons/io5";
import ImageSlider from "../components/SlideImages";
import CommentModal from "../components/CommentModal";
import { useRestaurantContext } from "../contexts/RestaurantContext";

const RestaurantItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { restaurants, setRestaurants, comments, setComments } = useRestaurantContext();

  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return <div className="p-4">Không tìm thấy nhà hàng.</div>;
  }

  const imageArray = restaurant.image;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showFullImage, setShowFullImage] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showMap, setShowMap] = useState<boolean>(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showComments, setShowComments] = useState(false);

  const getComments = () => {
    const filtered = comments.filter(
      (comment) => comment.restaurantId === restaurant.id
    );
    setComments(filtered);
  };

  const getRating = () => {
    const total = comments.reduce((acc, comment) => acc + comment.rating, 0);
    if (comments.length === 0) return 0;
    const averageRating = total / comments.length;
    return averageRating.toFixed(1);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      )
    );
  };

  const handleShare = async () => {
    const shareText = `${restaurant.name} - ${restaurant.location}\nLocation: https://maps.google.com/?q=${restaurant.coordinates?.latitude},${restaurant.coordinates?.longitude}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        alert("Failed to share.");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Location copied to clipboard!");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const getCategory = () => {
    const cat = categories.find((c) => c.id === restaurant.category);
    if (!cat) return null;
    const iconName = cat.icon
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    const Icon = Ionicons[`Io${iconName}` as keyof typeof Ionicons];
    return { icon: Icon, name: cat.name };
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const updated = [url, ...restaurant.image];
    const updatedRestaurant = { ...restaurant, image: updated };
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurant.id ? updatedRestaurant : r))
    );
  };

  const handleMapClick = () => {
    setShowMap(!showMap);
  };

  useEffect(() => {
    getComments();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft />
        </button>
        <h1 className="ml-4 text-xl font-bold">{restaurant.name}</h1>
      </div>

      <ImageSlider images={imageArray} />

      <div className="space-y-4 mt-4">
        <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <Clock size={16} /> {restaurant.time}
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-500" /> {getRating()}
          </div>
          <div className="flex items-center gap-1">
            <Tag size={16} /> {restaurant.price}
          </div>
          {getCategory() &&
            (() => {
              const { icon: Icon, name } = getCategory()!;
              return (
                <div className="flex items-center gap-1">
                  <Icon size={16} /> {name}
                </div>
              );
            })()}
        </div>

        {restaurant.description && (
          <p className="text-gray-700">{restaurant.description}</p>
        )}

        <button
          className="flex items-center gap-2 text-blue-600 hover:underline"
          onClick={handleMapClick}
        >
          <MapPin size={20} /> {restaurant.location || "Location not specified"}
          <ChevronRight size={20} />
        </button>

        {showMap && (
          <MapView
            latitude={restaurant?.coordinates?.latitude!}
            longitude={restaurant?.coordinates?.longitude!}
          />
        )}

        {restaurant.contact?.phone && (
          <div>
            <h3 className="font-medium text-gray-800">Phone</h3>
            <p className="text-gray-600">{restaurant.contact.phone}</p>
          </div>
        )}
        {restaurant.contact?.website && (
          <div>
            <h3 className="font-medium text-gray-800">Website</h3>
            <a
              href={restaurant.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {restaurant.contact.website}
            </a>
          </div>
        )}
        {restaurant.operatingHours && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Opening Hours</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
                <li key={day} className="flex justify-between">
                  <span className="capitalize">{day}</span>
                  <span>
                    {hours.open} - {hours.close}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {restaurant.features && (
          <div>
            <h3 className="font-medium text-gray-800">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {restaurant.features.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-200 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6 border-t pt-4 gap-4 text-sm text-gray-700">
        <button
          className="flex items-center gap-1"
          onClick={() => setShowComments(true)}
        >
          <MessageCircle size={20} /> {comments.length}
        </button>
        <button
          className="flex items-center gap-1"
          onClick={() => handleLikeComment(comments[0]?.id)}
        >
          <Heart size={20} /> Like
        </button>
        <button className="flex items-center gap-1" onClick={handleShare}>
          <Share2 size={20} /> Share
        </button>
        <label className="flex items-center gap-1 cursor-pointer">
          <Upload size={20} /> Upload
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {showFullImage && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <button
            className="p-4 self-end text-white"
            onClick={() => setShowFullImage(false)}
          >
            <X size={28} />
          </button>
          <img
            src={imageArray[0]}
            alt="Full"
            className="object-contain flex-1"
          />
        </div>
      )}

      {showComments && (
        <CommentModal
          restaurantId={restaurant.id}
          comments={comments}
          setComments={setComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
};

export default RestaurantItem;
