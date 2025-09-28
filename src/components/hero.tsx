"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";

type Slide = {
  title: string;
  subtitle: string;
  image: string;
};

const slides: Slide[] = [
  {
    title: "Temukan Penginapan Impian Anda",
    subtitle: "Sewa properti dengan mudah, dari apartemen nyaman hingga villa mewah.",
    image: "/images/hero-1.jpg",
  },
  {
    title: "Promo Spesial Akhir Tahun",
    subtitle: "Dapatkan diskon hingga 50% untuk booking bulan ini.",
    image: "/images/hero-2.jpg",
  },
  {
    title: "Liburan Nyaman & Aman",
    subtitle: "Jelajahi destinasi terbaik dengan properti terpercaya.",
    image: "/images/hero-3.jpg",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: "performance",
    slides: {
      perView: 1,
    },
    drag: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  // Auto play
  useEffect(() => {
    const interval = setInterval(() => {
      if (instanceRef.current) {
        instanceRef.current.next();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  return (
    <section className="relative w-full h-[55vh] md:h-[60vh] overflow-hidden">
      {/* Slides */}
      <div ref={sliderRef} className="keen-slider h-full">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="keen-slider__slide relative flex items-center justify-center h-full"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Text Content */}
            <div className="relative z-10 text-center px-6 max-w-2xl animate-fadeInUp">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
                {slide.title}
              </h1>
              <p className="mt-4 text-base md:text-lg text-white/90">
                {slide.subtitle}
              </p>
              <button
                className="mt-6 px-6 py-3 rounded-full font-semibold text-white bg-[#2f567a] hover:bg-[#23425e] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Mulai Booking
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-30 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => instanceRef.current?.moveToIdx(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === currentSlide ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
