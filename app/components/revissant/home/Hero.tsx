// app/components/revissant/home/Hero.tsx
import {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router';

const CATALOG_SEGMENT = 'catalog';

function getLocalePrefixedPath(pathname: string, segment: string) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const base = match && match.length > 0 ? match[0] : '/';
  return base === '/' ? `/${segment}` : `${base}${segment}`;
}

export function Hero() {
  const {pathname} = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toCatalog = getLocalePrefixedPath(pathname, CATALOG_SEGMENT);

  return (
    <section
      className="relative w-screen overflow-hidden left-1/2 -translate-x-1/2"
      style={{
        backgroundColor: '#0F2445',
        // Mantém o logo alinhado com a WelcomeScreen sem mexer no botão EXPLORE.
        marginTop: 'calc(var(--header-height) * -0.55)',
        // Evita que o início da secção seguinte (branca) apareça no fundo do viewport.
        // O dobro do offset mantém o conteúdo no mesmo sítio visual.
        height: 'calc(100vh + (var(--header-height) * 1.1))',
      }}
    >
      {/* Content layer */}
      <div
        className="absolute inset-0 z-20"
        style={{
          // Mantém o conteúdo (logo + botão) exatamente na mesma posição visual de antes.
          transform: 'translateY(calc(var(--header-height) * -0.55))',
        }}
      >
        <div
          className={[
            'relative h-full w-full flex flex-col items-center justify-center text-center px-4',
            'transition-all duration-700 ease-out transform-gpu',
            isScrolled ? 'opacity-0 -translate-y-10 blur-sm' : 'opacity-100 translate-y-0 blur-0',
          ].join(' ')}
        >
          {/* Main Hero Logo (usar logotipo) */}
          <img
            src="/logowhite.png"
            alt="Revissant"
            draggable={false}
            className="w-[430px] sm:w-[560px] md:w-[700px] max-w-[92vw] h-auto select-none animate-fade-in"
            style={{
              marginTop: 'clamp(4px, 0.8vw, 10px)',
              // `animate-fade-in` também anima `transform`; usa `top` para o ajuste fino.
              position: 'relative',
              top: 'clamp(28px, 7vw, 65px)',
            }}
          />

          {/* Botão */}
          <Link
            to={toCatalog}
            prefetch="intent"
            className="
              hero-explore-link relative z-20 mt-[clamp(34px,5vw,58px)]
              bg-transparent border border-white text-white visited:text-white
              px-12 py-3 rounded-none
              text-xs md:text-sm font-bold tracking-[0.25em]
              no-underline hover:no-underline focus:no-underline
              hover:bg-white hover:text-[#0F2445]
              transition-all duration-500 ease-in-out uppercase
              animate-fade-in delay-200
            "
            style={{
              animationDelay: '200ms',
              textDecoration: 'none',
              top: 'clamp(-58px, -6vh, -90px)',
            }}
          >
            EXPLORE
          </Link>
        </div>
      </div>

      <style>{`
        .hero-explore-link,
        .hero-explore-link:visited,
        .hero-explore-link:hover,
        .hero-explore-link:focus,
        .hero-explore-link:active {
          text-decoration: none !important;
        }

        .hero-explore-link,
        .hero-explore-link:visited {
          color: #ffffff !important;
        }

        .hero-explore-link:hover,
        .hero-explore-link:focus-visible {
          background-color: #ffffff !important;
          color: #0f2445 !important;
          border-color: #ffffff !important;
        }

        @media (max-width: 420px) {
          .hero-explore-link {
            padding-left: 2rem;
            padding-right: 2rem;
            top: -34px !important;
          }
        }
      `}</style>
    </section>
  );
}
