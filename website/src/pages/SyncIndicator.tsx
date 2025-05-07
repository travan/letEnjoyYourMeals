import React, { useEffect, useState } from "react";
import { useRestaurantStore } from "../store/restaurantStore";
import { useCommentStore } from "../store/commentStore";
import { Loader2, CheckCircle } from "lucide-react";

const SyncIndicator: React.FC = () => {
  const restaurantPending = useRestaurantStore((state) => state.pendingChanges);
  const commentPending = useCommentStore((state) => state.pendingChanges);
  const forceSyncRestaurants = useRestaurantStore(
    (state) => state.forceSyncChanges
  );
  const forceSyncComments = useCommentStore((state) => state.forceSyncChanges);

  const totalPending = restaurantPending + commentPending;

  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (totalPending === 0) {
      setShowSaved(true);
    }
  }, [totalPending]);

  useEffect(() => {
    if (showSaved) {
      const timer = setTimeout(() => setShowSaved(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showSaved]);

  const handleForceSync = async () => {
    await Promise.all([forceSyncRestaurants(), forceSyncComments()]);
  };

  if (showSaved) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-xl shadow-md transition-all animate-fade-in">
        <CheckCircle className="w-5 h-5" />
        <span>All changes saved</span>
      </div>
    );
  }

  if (totalPending > 0) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl shadow-md transition-all animate-pulse">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{totalPending} waiting to sync</span>
        <button
          onClick={handleForceSync}
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-3 py-1 rounded-md transition"
        >
          Sync now
        </button>
      </div>
    );
  }

  return null;
};

export default SyncIndicator;
