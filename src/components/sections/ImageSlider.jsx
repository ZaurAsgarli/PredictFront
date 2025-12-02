import { memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const sliderImages = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80',
    title: 'Make Smart Predictions',
    subtitle: 'Use your knowledge to predict outcomes',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80',
    title: 'Compete & Win',
    subtitle: 'Join the leaderboard and earn rewards',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1920&q=80',
    title: 'Join the Community',
    subtitle: 'Connect with fellow predictors',
  },
];

const ImageSlider = memo(() => {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        className="h-full w-full"
      >
        {sliderImages.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/80"></div>
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
              >
                {slide.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-200 max-w-2xl"
              >
                {slide.subtitle}
              </motion.p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
});

ImageSlider.displayName = 'ImageSlider';

export default ImageSlider;

