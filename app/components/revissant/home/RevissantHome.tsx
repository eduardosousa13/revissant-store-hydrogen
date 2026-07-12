// app/components/revissant/home/RevissantHome.tsx
import {useEffect, useState} from 'react';
import {WelcomeScreen} from './WelcomeScreen';
import {NewsletterPopup} from './NewsletterPopup';
import {Hero} from './Hero';
import {BestSellers} from './BestSellers';
import Features from './Features';

export type BestSellerProduct = {
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

type RevissantHomeProps = {
  bestSellers?: BestSellerProduct[];
};

const WELCOME_SESSION_KEY = 'revissant:welcome-seen';

export function RevissantHome({bestSellers = []}: RevissantHomeProps) {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);

  useEffect(() => {
    try {
      setShouldShowWelcome(
        window.sessionStorage.getItem(WELCOME_SESSION_KEY) !== 'true',
      );
    } catch {
      setShouldShowWelcome(true);
    }
  }, []);

  function handleWelcomeFinished() {
    try {
      window.sessionStorage.setItem(WELCOME_SESSION_KEY, 'true');
    } catch {
      // If storage is unavailable, still unblock the storefront for this render.
    }
    setShouldShowWelcome(false);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0F2445]">
      {shouldShowWelcome ? (
        <WelcomeScreen onFinished={handleWelcomeFinished} />
      ) : null}

      <NewsletterPopup />

      {/* Home sections */}
      <Hero />
      <BestSellers products={bestSellers} />
      <Features />
    </main>
  );
}
