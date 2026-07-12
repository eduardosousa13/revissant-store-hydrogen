import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {pushToast} from '~/components/revissant/ui/toast';
import {getLocalePathPrefix} from '~/components/revissant/utils/getLocalePathPrefix';
type Money = {amount: string; currencyCode: string};

type ProductImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type Recommendation = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  priceRange: {minVariantPrice: Money};
  selectedOrFirstAvailableVariant?: Variant | null;
};

type SelectedOption = {name: string; value: string};

type OptionValue = {
  name: string;
  firstSelectableVariant?: {
    image?: ProductImage | null;
  } | null;
  swatch?: {
    color?: string | null;
    image?: {previewImage?: {url: string} | null} | null;
  } | null;
};

type ProductOption = {
  name: string;
  optionValues: OptionValue[];
};

type Variant = {
  availableForSale?: boolean;
  id: string;
  image?: ProductImage | null;
  price: Money;
  compareAtPrice?: Money | null;
  selectedOptions: SelectedOption[];
};

type Product = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  productType?: string | null;
  material?: {value?: string | null} | null;
  images?: {nodes: ProductImage[]} | null;
  options?: ProductOption[] | null;
};

function formatMoney(amount: string, currencyCode: string) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return `${amount} ${currencyCode}`;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currencyCode}`;
  }
}

function splitTitleTwoLines(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) return {top: title, bottom: ''};
  return {
    top: parts.slice(0, -1).join(' '),
    bottom: parts.slice(-1).join(' '),
  };
}

export function RevissantProductPage(props: {
  product: Product;
  selectedVariant: Variant;
  recommendations: Recommendation[];
}) {
  const {product, selectedVariant, recommendations} = props;

  const navigate = useNavigate();
  const location = useLocation();
  const {locale} = useParams();
  const {open} = useAside();
  const [searchParams] = useSearchParams();
  const localePrefix = getLocalePathPrefix(locale);

  function getProductPath(handle: string) {
    return `${localePrefix}/products/${handle}`;
  }

 // ---------- COLOR SWATCHES (shopify options) ----------
  const colorOption =
    product.options?.find((o) => o.name.toLowerCase() === 'color') ??
    product.options?.[0] ??
    null;

  // ---------- IMAGES (carousel local) ----------
  const images = useMemo(() => {
    const list = product.images?.nodes?.filter(Boolean) ?? [];
    // fallback: se não houver images, tenta a do selectedVariant
    if (list.length === 0 && selectedVariant.image?.url) return [selectedVariant.image];
    return list;
  }, [product.images, selectedVariant.image]);

  const [activeIdx, setActiveIdx] = useState(0);

const lastVariantImageUrlRef = useRef<string | null>(null);

useEffect(() => {
  const variantUrl = selectedVariant?.image?.url ?? null;
  if (!variantUrl) return;
  if (!images.length) return;

  // Só “snap” quando a variante mudou (URL nova)
  if (lastVariantImageUrlRef.current === variantUrl) return;

  const idx = images.findIndex((img) => img?.url === variantUrl);

  // Se a imagem da variante existir na galeria, saltamos para ela
  if (idx >= 0) {
    setActiveIdx(idx);
  }

  lastVariantImageUrlRef.current = variantUrl;
}, [selectedVariant?.image?.url, images]);

  // --- indices âncora (início de cada variante) pela ordem das images do Shopify ---
  const anchorIdxs = useMemo(() => {
    const idxs: number[] = [];
    if (!colorOption || !images.length) return idxs;

    for (const v of colorOption.optionValues) {
      const url = v.firstSelectableVariant?.image?.url;
      if (!url) continue;
      const idx = images.findIndex((img) => img?.url === url);
      if (idx >= 0) idxs.push(idx);
    }

    return Array.from(new Set(idxs)).sort((a, b) => a - b);
  }, [colorOption, images]);

  // --- lista circular só do bloco da variante atual ---
  const segmentIdxs = useMemo(() => {
    if (!images.length) return [];

    // se não houver âncoras suficientes, fallback para loop global
    if (anchorIdxs.length <= 1) return images.map((_, i) => i);

    const currentUrl = selectedVariant.image?.url;
    if (!currentUrl) return images.map((_, i) => i);

    const startIdx = images.findIndex((img) => img?.url === currentUrl);
    if (startIdx < 0) return images.map((_, i) => i);

    const startAnchorPos = anchorIdxs.indexOf(startIdx);

    // se por alguma razão startIdx não está nas âncoras, ainda assim segmenta até à próxima âncora
    if (startAnchorPos < 0) {
      const nextAnchor = anchorIdxs.find((x) => x > startIdx) ?? anchorIdxs[0];

      if (nextAnchor > startIdx) {
        return Array.from({length: nextAnchor - startIdx}, (_, k) => startIdx + k);
      }

      return [
        ...Array.from({length: images.length - startIdx}, (_, k) => startIdx + k),
        ...Array.from({length: nextAnchor}, (_, k) => k),
      ];
    }

    const nextAnchorPos = (startAnchorPos + 1) % anchorIdxs.length;
    const nextAnchorIdx = anchorIdxs[nextAnchorPos];

    if (nextAnchorIdx > startIdx) {
      return Array.from({length: nextAnchorIdx - startIdx}, (_, k) => startIdx + k);
    }

    return [
      ...Array.from({length: images.length - startIdx}, (_, k) => startIdx + k),
      ...Array.from({length: nextAnchorIdx}, (_, k) => k),
    ];
  }, [anchorIdxs, images, selectedVariant.image?.url]);



  function prevImg() {
    if (!segmentIdxs.length) return;
    const pos = segmentIdxs.indexOf(activeIdx);
    const safePos = pos === -1 ? 0 : pos;
    const prevPos = (safePos - 1 + segmentIdxs.length) % segmentIdxs.length;
    setActiveIdx(segmentIdxs[prevPos]);
  }

  function nextImg() {
    if (!segmentIdxs.length) return;
    const pos = segmentIdxs.indexOf(activeIdx);
    const safePos = pos === -1 ? 0 : pos;
    const nextPos = (safePos + 1) % segmentIdxs.length;
    setActiveIdx(segmentIdxs[nextPos]);
  }

  const activeImage = images[activeIdx];

  



  const selectedColorValue =
    selectedVariant.selectedOptions.find(
      (o) => colorOption && o.name.toLowerCase() === colorOption.name.toLowerCase(),
    )?.value ?? '';

  function setOptionInUrl(optionName: string, value: string) {
    const next = new URLSearchParams(searchParams);
    next.set(optionName, value);
    // mantém o resto dos params
    navigate(`${location.pathname}?${next.toString()}`, {replace: true});
  }

  // ---------- TEXT FIELDS ----------
  const {top, bottom} = splitTitleTwoLines(product.title);

  const material =
    product.material?.value?.trim() ||
    ''; // fallback vai ser tratado na UI

  const type = product.productType?.trim() || '';

  const description = (product.description ?? '').trim();

  return (
    <div className="rvp-root">
      <style>{`
        :root{
          --rv-dark:#0b1a2b;        /* aproximação */
          --rv-blue:#60a5fa;        /* aproximação */
          --rv-gray-50:#f9fafb;
          --rv-gray-100:#f3f4f6;
          --rv-gray-200:#e5e7eb;
          --rv-gray-300:#d1d5db;
          --rv-gray-400:#9ca3af;
          --rv-gray-500:#6b7280;
        }

        .rvp-root{
          padding: 32px 16px 80px;
          animation: rvpFade 220ms ease-out;
        }
        @media (max-width: 640px){
          .rvp-root{ padding-top: 8px; }
        }
        @keyframes rvpFade{
          from{opacity:0; transform:translateY(4px);}
          to{opacity:1; transform:translateY(0);}
        }

        .rvp-container{
          max-width: 1240px;
          margin: 0 auto;
        }

        .rvp-top{
          display:flex;
          flex-direction:column;
          gap: 48px;
          align-items:center;
          margin-bottom: 96px;
        }
        @media (max-width: 640px){
          .rvp-top{
            gap: 34px;
            margin-bottom: 64px;
          }
        }
        @media (min-width: 1024px){
          .rvp-top{
            flex-direction:row;
            align-items:flex-start;
          }
        }

        /* LEFT - IMAGE */
        .rvp-left{
          width: 100%;
          position: relative;
          display:flex;
          align-items:center;
          justify-content:center;
        }
        @media (min-width: 1024px){
          .rvp-left{ width: 50%; }
        }

        .rvp-arrow{
          position:absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border:0;
          background: transparent;
          cursor:pointer;
          color: var(--rv-dark);
          display:flex;
          align-items:center;
          justify-content:center;
          transition: background 180ms ease, opacity 180ms ease;
        }
        .rvp-arrow:hover{ background: var(--rv-gray-100); }
        .rvp-arrow.left{ left: 0; }
        .rvp-arrow.right{ right: 0; }

        .rvp-imgFrame{
          width: 80%;
          aspect-ratio: 3 / 4;
          overflow:hidden;
          background: var(--rv-gray-100);
        }
        @media (max-width: 640px){
          .rvp-imgFrame{
            width: min(82vw, 280px);
            aspect-ratio: 1 / 1.12;
          }
          .rvp-arrow{
            width: 34px;
            height: 44px;
          }
        }
        .rvp-img{
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        /* RIGHT - DETAILS */
        .rvp-right{
          width: 100%;
          padding: 16px 0;
        }
        @media (min-width: 1024px){
          .rvp-right{
            width: 50%;
            padding: 32px 0;
            padding-left: 48px;
            padding-right: 48px;
          }
        }

        .rvp-title{
          color: var(--rv-dark);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          text-transform: uppercase;
          line-height: 1.05;
          margin: 0 0 10px;
          letter-spacing: .02em;
          font-size: clamp(26px, 9vw, 42px);
          overflow-wrap: anywhere;
        }
        @media (min-width: 1024px){
          .rvp-title{ font-size: 52px; }
        }

        .rvp-sep{
          width: 100%;
          height: 1px;
          background: var(--rv-gray-300);
          margin: 28px 0;
        }

        .rvp-subLabel{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          letter-spacing: .20em;
          font-size: 12px;
          color: var(--rv-dark);
          margin-bottom: 14px;
          text-transform: uppercase;
        }

        /* Swatches */
        .rvp-swatches{
          display:flex;
          gap: 24px;
          align-items:flex-start;
        }
        .rvp-swatchWrap{
          display:flex;
          flex-direction:column;
          align-items:center;
          gap: 10px;
        }
        .rvp-swatchBtn{
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 2px solid transparent;
          cursor:pointer;
          transition: transform 180ms ease, border-color 180ms ease;
        }
        .rvp-swatchBtn.active{
          border-color: var(--rv-dark);
          transform: scale(1.10);
        }
        .rvp-swatchLine{
          width: 32px;
          height: 6px;
          background: var(--rv-gray-500);
          border-radius: 999px;
        }

        /* Spec rows */
        .rvp-specs{
          display:flex;
          flex-direction:column;
          gap: 14px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-size: 13px;
        }
        .rvp-row{
          display:flex;
          gap: 16px;
          align-items:flex-start;
        }
        .rvp-key{
          min-width: 110px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--rv-dark);
        }
        .rvp-val{
          color: var(--rv-gray-500);
          line-height: 1.6;
          max-width: 420px;
        }

        /* Price + button */
        .rvp-priceRow{
          display:flex;
          gap: 28px;
          align-items:center;
        }
        .rvp-priceBox{
          display:flex;
          flex-direction:column;
        }
        .rvp-compare{
          color: var(--rv-gray-400);
          text-decoration: line-through;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 4px;
        }
        .rvp-price{
          color: var(--rv-dark);
          font-weight: 900;
          font-size: clamp(34px, 12vw, 54px);
          letter-spacing: .02em;
        }
        .rvp-addBtn{
          background: #111827; /* gray-900 */
          color: #fff;
          border:0;
          padding: 14px 32px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
          cursor: default; /* read-only */
          box-shadow: 0 8px 18px rgba(0,0,0,.12);
          transition: background 180ms ease;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        }
        .rvp-addBtn:hover{
          background: var(--rv-blue);
        }

        /* Recommendations */
        .rvp-recoWrap{
          border-top: 1px solid var(--rv-gray-100);
          padding-top: 64px;
        }
        .rvp-recoTitle{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--rv-dark);
          margin-bottom: 32px;
        }
        .rvp-recoGrid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 24px;
        }
        @media (min-width: 768px){
          .rvp-recoGrid{ grid-template-columns: repeat(4, minmax(0,1fr)); }
        }

        .rvp-card{
          display:flex;
          flex-direction:column;
          align-items:center;
        }

        .rvp-cardImgWrap{
          width: 100%;
          aspect-ratio: 1 / 1;
          background: var(--rv-gray-100);
          overflow:hidden;
          position:relative;
          cursor:pointer;
          margin-bottom: 14px;
        }
        .rvp-cardImg{
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms ease;
        }
        .rvp-cardImgWrap:hover .rvp-cardImg{
          transform: scale(1.05);
        }

        .rvp-overlay{
          position:absolute;
          inset:0;
          background: rgba(11, 26, 43, 0.40);
          opacity:0;
          transition: opacity 300ms ease;
          display:flex;
          align-items:center;
          justify-content:center;
          pointer-events:none;
        }
        .rvp-cardImgWrap:hover .rvp-overlay{ opacity:1; }
        .rvp-overlayText{
          color:#fff;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: .16em;
          text-transform: uppercase;
          text-shadow: 0 2px 10px rgba(0,0,0,.25);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        }

        .rvp-cardName{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: .10em;
          text-transform: uppercase;
          color: var(--rv-dark);
          margin: 0 0 6px;
          text-align:center;
        }
        .rvp-cardNameLink{
          display:block;
          color: inherit;
          text-decoration: none;
        }
        .rvp-cardPrice{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 900;
          font-size: 11px;
          color: var(--rv-dark);
          margin: 0 0 10px;
          text-align:center;
        }
        .rvp-cardBtn{
          background:#000;
          color:#fff;
          border:0;
          padding: 6px 14px;
          font-weight: 900;
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
          transition: background 180ms ease;
          cursor: pointer;
        }
        .rvp-cardBtn:hover{ background: var(--rv-blue); }
        .rvp-cardBtn:disabled{
          opacity: .65;
          cursor: not-allowed;
        }
      `}</style>

      <div className="rvp-container">
        <div className="rvp-top">
          {/* LEFT */}
          <div className="rvp-left">
            <button
              type="button"
              className="rvp-arrow left"
              onClick={prevImg}
              aria-label="Previous image"
              title="Previous"
            >
              ‹
            </button>

            <div className="rvp-imgFrame">
              {activeImage?.url ? (
                <img
                  className="rvp-img"
                  src={activeImage.url}
                  alt={activeImage.altText ?? product.title}
                />
              ) : (
                <div style={{width: '100%', height: '100%'}} />
              )}
            </div>

            <button
              type="button"
              className="rvp-arrow right"
              onClick={nextImg}
              aria-label="Next image"
              title="Next"
            >
              ›
            </button>
          </div>

          {/* RIGHT */}
          <div className="rvp-right">
            <h1 className="rvp-title">
              {top}
              {bottom ? (
                <>
                  <br />
                  {bottom}
                </>
              ) : null}
            </h1>

            <div className="rvp-sep" />

            {/* COLOR */}
            {colorOption ? (
              <div style={{marginBottom: 28}}>
                <div className="rvp-subLabel">COLOR</div>
                <div className="rvp-swatches">
                  {colorOption.optionValues.map((v) => {
                    const isActive = v.name === selectedColorValue;
                    const swatchColor =
                      v.swatch?.color ??
                      // fallback palette
                      (v.name.toLowerCase().includes('black')
                        ? '#111827'
                        : v.name.toLowerCase().includes('gray') ||
                          v.name.toLowerCase().includes('grey')
                        ? '#9CA3AF'
                        : v.name.toLowerCase().includes('beige') ||
                          v.name.toLowerCase().includes('sand') ||
                          v.name.toLowerCase().includes('tan')
                        ? '#D1B48C'
                        : '#1F2937');

                    return (
                      <div key={v.name} className="rvp-swatchWrap">
                        <button
                          type="button"
                          className={`rvp-swatchBtn ${isActive ? 'active' : ''}`}
                          style={{backgroundColor: swatchColor}}
                          onClick={() => setOptionInUrl(colorOption.name, v.name)}
                          aria-label={`Select ${v.name}`}
                          title={v.name}
                        />
                        {isActive ? <div className="rvp-swatchLine" /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="rvp-sep" />

            {/* MATERIAL / TYPE / DESCRIPTION */}
            <div className="rvp-specs">
              <div className="rvp-row">
                <div className="rvp-key">MATERIAL</div>
                <div className="rvp-val">{material || '—'}</div>
              </div>

              <div className="rvp-row">
                <div className="rvp-key">TYPE</div>
                <div className="rvp-val">{type || '—'}</div>
              </div>

              <div className="rvp-row">
                <div className="rvp-key">DESCRIPTION</div>
                <div className="rvp-val">{description || '—'}</div>
              </div>
            </div>

            <div className="rvp-sep" />

            {/* PRICE + BUTTON */}
            <div className="rvp-priceRow">
              <div className="rvp-priceBox">
                {selectedVariant.compareAtPrice ? (
                  <div className="rvp-compare">
                    {formatMoney(
                      selectedVariant.compareAtPrice.amount,
                      selectedVariant.compareAtPrice.currencyCode,
                    )}
                  </div>
                ) : null}

                <div className="rvp-price">
                  {formatMoney(
                    selectedVariant.price.amount,
                    selectedVariant.price.currencyCode,
                  )}
                </div>
              </div>

              <AddToCartButton
                buttonClassName="rvp-addBtn"
                disabled={!selectedVariant.availableForSale}
                lines={[
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]}
                onClick={() => {
                  open('cart');
                  pushToast({message: 'Product added to your cart'});
                }}
              >
                ADD TO CART
              </AddToCartButton>
            </div>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE */}
        <div className="rvp-recoWrap">
          <div className="rvp-recoTitle">YOU MAY ALSO LIKE</div>

          <div className="rvp-recoGrid">
            {(recommendations ?? []).slice(0, 4).map((r) => (
              <div key={r.id} className="rvp-card">
                {(() => {
                  const selectedVariant = r.selectedOrFirstAvailableVariant;
                  const isAvailable = Boolean(selectedVariant?.availableForSale);
                  const buttonText = isAvailable ? 'ADD TO CART' : 'SOLD OUT';

                  return (
                    <>
                <div
                  className="rvp-cardImgWrap"
                  onClick={() => navigate(getProductPath(r.handle))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(getProductPath(r.handle));
                  }}
                >
                  {r.featuredImage?.url ? (
                    <img
                      className="rvp-cardImg"
                      src={r.featuredImage.url}
                      alt={r.featuredImage.altText ?? r.title}
                    />
                  ) : (
                    <div style={{width: '100%', height: '100%'}} />
                  )}

                  <div className="rvp-overlay">
                    <div className="rvp-overlayText">BUY NOW</div>
                  </div>
                </div>

                <div style={{width: '100%'}}>
                  <Link
                    to={getProductPath(r.handle)}
                    className="rvp-cardNameLink"
                  >
                    <div className="rvp-cardName">{r.title}</div>
                  </Link>
                  <div className="rvp-cardPrice">
                    {formatMoney(
                      r.priceRange.minVariantPrice.amount,
                      r.priceRange.minVariantPrice.currencyCode,
                    )}
                  </div>

                  <div style={{display: 'flex', justifyContent: 'center'}}>
                    <AddToCartButton
                      buttonAriaLabel={`${buttonText} ${r.title}`}
                      buttonClassName="rvp-cardBtn"
                      disabled={!selectedVariant || !isAvailable}
                      lines={
                        selectedVariant
                          ? [
                              {
                                merchandiseId: selectedVariant.id,
                                quantity: 1,
                                selectedVariant,
                              },
                            ]
                          : []
                      }
                      onClick={() => {
                        open('cart');
                        pushToast({message: 'Product added to your cart'});
                      }}
                    >
                      {buttonText}
                    </AddToCartButton>
                  </div>

                  {/* opcional: link invisível para debug */}
                  <div style={{opacity: 0}}>
                    <Link to={getProductPath(r.handle)}>Open</Link>
                  </div>
                </div>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
