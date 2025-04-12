import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageSlider({
  images,
  autoPlay = true,
  interval = 3000,
}: ImageSliderProps) {
  const [current, setCurrent] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const prev = () =>
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev + 1) % images.length);

  return (
    <div className="w-full">
      {/* Slider Frame */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-gray-200">
        <img
          src={images[current]}
          alt={`Slide ${current + 1}`}
          onClick={() => setShowFullImage(true)}
          className="object-cover w-full h-full cursor-zoom-in transition-all duration-300"
        />
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
        >
          <ChevronRight />
        </button>
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-sm px-2 py-1 rounded-full">
          {current + 1}/{images.length}
        </div>
      </div>

      {/* Thumbnail preview */}
      <div className="flex mt-2 gap-2 overflow-x-auto">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            onClick={() => setCurrent(index)}
            className={`h-16 w-24 object-cover rounded-md cursor-pointer border-2 ${
              current === index
                ? "border-blue-500"
                : "border-transparent hover:border-gray-400"
            }`}
            alt={`Thumb ${index + 1}`}
          />
        ))}
      </div>

      {/* Zoomed full image */}
      {showFullImage && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={images[current]}
            className="max-h-[90vh] max-w-[90vw] object-contain cursor-zoom-out rounded-md"
            alt="Zoomed"
          />
        </div>
      )}
    </div>
  );
}
