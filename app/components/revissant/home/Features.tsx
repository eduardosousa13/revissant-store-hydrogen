import {Link, useParams} from 'react-router';
import {getLocalePathPrefix} from '~/components/revissant/utils/getLocalePathPrefix';

/**
 * FEATURES (AI Studio) → Hydrogen
 * - Mantém as 2 secções juntas (pedido do projeto)
 * - Sem lucide-react: ícones em SVG inline (stroke fino, hover scale)
 * - Classes/timings replicados do AI Studio o mais 1:1 possível
 */

type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

function IconTruck({size = 36, strokeWidth = 1, className}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 7h11v10H3V7Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M14 11h4l3 3v3h-7v-6Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M7 17a2 2 0 1 0 0.001 0Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M17 17a2 2 0 1 0 0.001 0Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M14 17h-3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconAward({size = 36, strokeWidth = 1, className}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2l3 3v5a5 5 0 1 1-6 0V5l3-3Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="M9 17l-1 5 4-2 4 2-1-5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRotateCcw({size = 36, strokeWidth = 1, className}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 12a9 9 0 1 0 3-6.7"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M3 4v5h5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Features() {
  const {locale} = useParams();
  const localePrefix = getLocalePathPrefix(locale);

  return (
    <section className="w-full">
      {/* Features Icons Section (THE REVISSANT STANDARD) */}
      <div className="bg-[#0F2445] py-24 text-white relative overflow-hidden">
        {/* Decorative top line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.15em] text-white uppercase">
              The Revissant Standard
            </h2>
            <div className="w-16 h-0.5 bg-blue-200 mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto px-4">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:border-blue-200/50 group-hover:bg-blue-200/10 transition-all duration-500">
                <IconTruck
                  size={36}
                  strokeWidth={1}
                  className="text-blue-200 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-lg tracking-[0.2em] uppercase mb-4 text-white">
                Fast Shipping
              </h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xs mx-auto">
                Complimentary expedited delivery on all orders worldwide. Your luxury arrives
                when you expect it.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:border-blue-200/50 group-hover:bg-blue-200/10 transition-all duration-500">
                <IconAward
                  size={36}
                  strokeWidth={1}
                  className="text-blue-200 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-lg tracking-[0.2em] uppercase mb-4 text-white">
                High Quality
              </h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xs mx-auto">
                Meticulously crafted using only the finest sustainable materials. Designed to last
                a lifetime.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:border-blue-200/50 group-hover:bg-blue-200/10 transition-all duration-500">
                <IconRotateCcw
                  size={36}
                  strokeWidth={1}
                  className="text-blue-200 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-lg tracking-[0.2em] uppercase mb-4 text-white">
                Return Policy
              </h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xs mx-auto">
                Shop with total confidence. Enjoy our 30-day hassle-free return guarantee on all
                items.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Banner Section */}
      <div className="relative h-[650px] w-full overflow-hidden group">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-105 opacity-80"
          >
            <source
              src="https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_30fps.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2445]/90 via-[#0F2445]/40 to-transparent" />

        {/* Content Card */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-24 max-w-lg">
          <div className="bg-[#0F2445]/60 backdrop-blur-xl p-10 md:p-14 border-l-[6px] border-blue-200 text-white shadow-2xl animate-fade-in relative overflow-hidden rounded-none">
            {/* Decorative Icon inside card */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <IconAward size={100} strokeWidth={1} className="text-white" />
            </div>

            <span className="text-blue-200 text-xs font-bold tracking-[0.4em] uppercase mb-6 block relative z-10">
              What is Revissant?
            </span>

            <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-6 relative z-10">
              A New Dawn <br /> Of Living
            </h2>

            <p className="text-sm md:text-base text-gray-200 font-light leading-relaxed mb-10 relative z-10">
              We believe your home is your sanctuary. Discover a curated collection of home
              essentials designed to elevate your everyday living space into a masterpiece of
              comfort and style.
            </p>

            <Link
              to={`${localePrefix}/catalog`}
              prefetch="intent"
              className="bg-white text-[#0F2445] px-10 py-4 rounded-none text-xs font-bold tracking-[0.25em] uppercase hover:bg-blue-200 hover:text-[#0F2445] transition-all duration-300 shadow-lg relative z-10 inline-block whitespace-nowrap"
            >
              Shop Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
