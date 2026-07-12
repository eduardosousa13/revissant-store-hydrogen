import {useMemo, useState} from 'react';
import {Link, useParams} from 'react-router';
import {getLocalePathPrefix} from '~/components/revissant/utils/getLocalePathPrefix';

type BestSellerProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  priceRange?: {
    minVariantPrice?: {
      amount: string;
      currencyCode: string;
    } | null;
  } | null;
};

type BestSellersProps = {
  products: BestSellerProduct[];
};

function StarIcon({size = 20, className}: {size?: number; className?: string}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.9 6.1 6.7.9-4.9 4.7 1.2 6.6L12 17l-5.9 3.3 1.2-6.6L2.4 9l6.7-.9L12 2z" />
    </svg>
  );
}

function ChevronLeftIcon({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
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
        d="m15 6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
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
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatMoney(amount?: string, currency?: string) {
  if (!amount || !currency) return '';
  const n = Number(amount);
  if (Number.isNaN(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function BestSellers({products}: BestSellersProps) {
  const {locale} = useParams();
  const localePrefix = getLocalePathPrefix(locale);
  const carouselProducts = useMemo(
    () => products?.filter(Boolean) ?? [],
    [products],
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = carouselProducts.length;

  const nextSlide = () => {
    if (!total) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (!total) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-white">
      {/* Animated Background Blob */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl animate-subtle-pulse" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#C4A484]/10 rounded-full blur-3xl animate-subtle-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-12">
        {/* Left Title */}
        <div className="w-full md:w-1/3 pl-4 md:pl-12 mb-8 md:mb-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2 text-emerald-500">
            <StarIcon size={20} />
            <span className="font-bold text-sm">Trustpilot</span>
          </div>
          <h2 className="font-bold text-5xl md:text-7xl text-[#0F2445] leading-tight tracking-tight">
            BEST<br />
            SELLERS
          </h2>
          <span className="font-serif text-xl tracking-[0.3em] text-[#0F2445] mt-4 block">
            REVISSANT
          </span>
        </div>

        {/* Carousel Area */}
        <div className="w-full md:w-2/3 flex items-center justify-center gap-2 md:gap-4 select-none relative h-[450px]">
          <button
            onClick={prevSlide}
            className="absolute left-0 md:relative z-40 p-2 text-[#0F2445] hover:bg-[#0F2445] hover:text-white transition-colors bg-white/80 rounded-none md:bg-transparent shadow-md md:shadow-none"
            aria-label="Previous Product"
            type="button"
          >
            <ChevronLeftIcon />
          </button>

          <div className="relative h-full w-full max-w-[800px] flex items-center justify-center [perspective:1000px]">
            {carouselProducts.map((product, index) => {
              const total = carouselProducts.length;
              let offset = (index - currentIndex + total) % total;
              if (offset > total / 2) offset -= total;

              let containerClasses =
                'absolute transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100 group';

              if (offset === 0) {
                containerClasses +=
                  ' z-30 scale-100 opacity-100 translate-x-0 w-[280px] h-[400px] md:w-[320px] md:h-[420px]';
              } else if (offset === -1) {
                containerClasses +=
                  ' z-20 scale-90 opacity-40 -translate-x-[60%] md:-translate-x-[260px] w-[280px] h-[400px] blur-[1px] grayscale cursor-pointer';
              } else if (offset === 1) {
                containerClasses +=
                  ' z-20 scale-90 opacity-40 translate-x-[60%] md:translate-x-[260px] w-[280px] h-[400px] blur-[1px] grayscale cursor-pointer';
              } else if (offset < -1) {
                containerClasses +=
                  ' z-10 scale-75 opacity-0 -translate-x-[120%] md:-translate-x-[450px] w-[280px] h-[400px] pointer-events-none';
              } else {
                containerClasses +=
                  ' z-10 scale-75 opacity-0 translate-x-[120%] md:translate-x-[450px] w-[280px] h-[400px] pointer-events-none';
              }

              const imgUrl = product.featuredImage?.url;
              const imgAlt = product.featuredImage?.altText || product.title;

              const price = formatMoney(
                product.priceRange?.minVariantPrice?.amount,
                product.priceRange?.minVariantPrice?.currencyCode,
              );

              if (offset === 0) {
                return (
                  <Link
                    key={product.id}
                    to={`${localePrefix}/products/${product.handle}`}
                    prefetch="intent"
                    className={containerClasses}
                    aria-label={`Open ${product.title}`}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={imgAlt}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end h-1/2">
                      <h3 className="text-3xl font-bold uppercase leading-none font-sans tracking-[0.25em] mb-3 drop-shadow-lg">
                        {product.title}
                      </h3>
                      <p className="text-xl font-bold font-sans text-blue-200 tracking-widest drop-shadow-md">
                        {price}
                      </p>
                    </div>
                  </Link>
                );
              }

              return (
                <div
                  key={product.id}
                  className={containerClasses}
                  onClick={() => {
                    if (offset === -1) prevSlide();
                    else if (offset === 1) nextSlide();
                    else setCurrentIndex(index);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (offset === -1) prevSlide();
                      else if (offset === 1) nextSlide();
                      else setCurrentIndex(index);
                    }
                  }}
                  aria-label={`Select ${product.title}`}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={imgAlt}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={nextSlide}
            className="absolute right-0 md:relative z-40 p-2 text-[#0F2445] hover:bg-[#0F2445] hover:text-white transition-colors bg-white/80 rounded-none md:bg-transparent shadow-md md:shadow-none"
            aria-label="Next Product"
            type="button"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="w-full text-right px-12 mt-8 relative z-20 hidden md:block">
        <Link
          to={`${localePrefix}/catalog`}
          prefetch="intent"
          className="text-[#0F2445] font-bold text-xl uppercase tracking-widest hover:text-blue-400 transition-colors border-b-2 border-transparent hover:border-blue-400 inline-block pb-1"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
