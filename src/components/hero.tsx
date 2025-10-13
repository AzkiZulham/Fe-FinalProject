"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause,  Star, Shield } from "lucide-react";

type Slide = {
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
};

const slides: Slide[] = [
  {
    title: "Temukan Penginapan Impian Anda",
    subtitle: "Sewa properti dengan mudah, dari apartemen nyaman hingga villa mewah dengan fasilitas terbaik.",
    image: "/images/hero-1.jpg",
    badge: "Trending"
  },
  {
    title: "Promo Spesial Akhir Tahun",
    subtitle: "Dapatkan diskon hingga 50% untuk booking bulan ini. Terbatas hanya untuk 100 customer pertama!",
    image: "/images/hero-2.jpg",
    badge: "Promo"
  },
  {
    title: "Liburan Nyaman & Terpercaya",
    subtitle: "Jelajahi destinasi terbaik dengan properti terverifikasi dan sistem keamanan terjamin.",
    image: "/images/hero-3.jpg",
    badge: "Terpercaya"
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: "performance",
    slides: {
      perView: 1,
    },
    drag: true,
    created: () => setIsVisible(true),
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      if (instanceRef.current) {
        instanceRef.current.next();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [instanceRef, isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextSlide = () => instanceRef.current?.next();
  const prevSlide = () => instanceRef.current?.prev();

  return (
    <section className="relative w-full h-[85vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-gray-900">
      <div
        ref={sliderRef}
        className={`keen-slider h-full transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className="keen-slider__slide relative flex items-center justify-center h-full"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-fixed scale-105 transition-transform duration-7000"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-600/10 to-transparent" />
            </div>

            <div className="absolute top-10 left-10 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Terverifikasi</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-[-160px] md:mt-[-120px] lg:mt-[-160px]">
              {slide.badge && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 mb-6 animate-fadeIn">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold tracking-wide">
                    {slide.badge}
                  </span>
                </div>
              )}

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {slide.title.split(' ').slice(0, -2).join(' ')}
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  {slide.title.split(' ').slice(-2).join(' ')}
                </span>
              </h1>

              <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
                {slide.subtitle}
              </p>

              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">10K+</div>
                  <div className="text-white/70 text-sm">Properti</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">50+</div>
                  <div className="text-white/70 text-sm">Kota</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">4.8</div>
                  <div className="flex justify-center items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
      <div className="absolute bottom-42 md:bottom-38 lg:bottom-47 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => instanceRef.current?.moveToIdx(i)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                i === currentSlide
                  ? "bg-white w-8 shadow-lg shadow-blue-500/50"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl" />
      </div>
    </section>
  );
}