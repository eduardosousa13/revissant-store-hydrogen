import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router';
import {useAside} from '~/components/Aside';
import {useLockBodyScroll} from '~/components/revissant/hooks/useLockBodyScroll';
import {getLocalePathPrefix} from '~/components/revissant/utils/getLocalePathPrefix';

const MENU_ITEMS: Array<{label: string; to: string}> = [
  {label: 'CATALOG', to: '/catalog'},
  {label: 'BEST DEALS', to: '/catalog'},
  {label: 'FAQ', to: '/faq'},
];

export function RevissantMobileMenuAside() {
  const {locale} = useParams();
  const {type, close} = useAside();
  const open = type === 'mobile';
  const [isVisible, setIsVisible] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const localePrefix = getLocalePathPrefix(locale);

  const animationMs = 500;

  useLockBodyScroll(open || isClosing);

  // ESC fecha (mesmo sem foco)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsClosing(false);
      return;
    }

    if (isVisible) {
      setIsClosing(true);
      const timer = window.setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, animationMs);

      return () => window.clearTimeout(timer);
    }
  }, [open, isVisible, animationMs]);

  if (!isVisible) return null;

  const stateClass =
    open && !isClosing
      ? 'revissant-mobile-menu--open'
      : 'revissant-mobile-menu--closing';

  return (
    <div
      className={`revissant-mobile-menu ${stateClass}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      {/* Backdrop (blur do ecra todo) */}
      <button
        className="revissant-mobile-menu__backdrop"
        aria-label="Close menu"
        onClick={close}
      />

      {/* Drawer */}
      <aside className="revissant-mobile-menu__drawer" aria-label="Menu">
        {/* Close (no lugar do hamburger) */}
        <button
          className="revissant-mobile-menu__close-btn"
          onClick={close}
          aria-label="Close menu"
          type="button"
        >
          <CloseIcon />
        </button>

        {/* Vertical decorative text */}
        <div className="revissant-mobile-menu__vertical">
          REVISSANT COLLECTION ©2024
        </div>

        {/* Nav */}
        <nav className="revissant-mobile-menu__nav">
          <div className="revissant-mobile-menu__new-row">
            <div className="revissant-mobile-menu__new">NEW</div>
          </div>

          <div className="revissant-mobile-menu__links">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={`${localePrefix}${item.to}`}
                className="revissant-mobile-menu__link"
                onClick={close}
              >
                <span className="revissant-mobile-menu__link-text">
                  {item.label}
                </span>
                <span className="revissant-mobile-menu__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Depth overlay (igual ao AI Studio) */}
        <div className="revissant-mobile-menu__depth" />
      </aside>
    </div>
  );
}

function CloseIcon() {
  // SVG para conseguirmos rodar no hover via CSS (igual ao AI Studio)
  return (
    <svg
      className="revissant-mobile-menu__close-icon"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
