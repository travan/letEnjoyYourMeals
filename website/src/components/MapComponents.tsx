import React from "react";

interface MapComponentProps {
  latitude: number;
  longitude: number;
  title?: string;
}

const MapView: React.FC<MapComponentProps> = ({ latitude, longitude, title }) => {
  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_MAPS_API_KEY&center=${latitude},${longitude}&zoom=15&maptype=roadmap`;

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg">
      <iframe
        title={title || "Map"}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapSrc}
      ></iframe>
    </div>
  );
};

export default MapView;
