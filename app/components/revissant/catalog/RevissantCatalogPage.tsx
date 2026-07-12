import React, {useEffect, useMemo, useState} from 'react';
import {
  Form,
  Link,
  useLoaderData,
  useNavigate,
  useParams,
  useSubmit,
} from 'react-router';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {pushToast} from '~/components/revissant/ui/toast';
import {getLocalePathPrefix} from '~/components/revissant/utils/getLocalePathPrefix';
import type {loader} from '~/routes/($locale).catalog';

type CatalogLoaderData = Awaited<ReturnType<typeof loader>>;
type CatalogProduct = CatalogLoaderData['products'][number];

const TAGS = [
  {label: 'NEW ARRIVALS', value: 'new'},
  {label: 'BEST SELLERS', value: 'best-seller'},
  {label: 'HOME', value: 'cat-home-dec'},
  {label: 'LIGHTING', value: 'cat-lighting'},
  {label: 'ELECTRONICS', value: 'cat-electronics'},
  {label: 'ACCESSORIES', value: 'cat-accessories'},
] as const;

const PRICE_RANGES = [
  {value: '', label: 'Any'},
  {value: '0-20', label: '0 — 20'},
  {value: '20-50', label: '20 — 50'},
  {value: '50-100', label: '50 — 100'},
  {value: '100+', label: '100+'},
] as const;

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

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, '');
}

export function RevissantCatalogPage() {
  const {products, selectedTag, selectedPriceRange} =
    useLoaderData<typeof loader>();

  const {open} = useAside();
  const navigate = useNavigate();
  const {locale} = useParams();
  const submit = useSubmit();
  const localePrefix = getLocalePathPrefix(locale);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTag, selectedPriceRange]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const q = normalize(searchQuery);
    return products.filter((p: CatalogProduct) => {
      const name = normalize(p.title);
      const tags = normalize((p.tags ?? []).join(' '));
      return name.includes(q) || tags.includes(q);
    });
  }, [products, searchQuery]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx = (page - 1) * itemsPerPage;
  const current = filtered.slice(startIdx, startIdx + itemsPerPage);

  function onAutoSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    submit(e.currentTarget, {replace: true});
  }

  function getProductPath(handle: string) {
    return `${localePrefix}/products/${handle}`;
  }

  return (
    <div className="rv-catalog revissant-page-offset">
      <style>{`
        .rv-catalog{
          --rv-dark:#0b1a2b;        /* aproximação do "revissant-dark" */
          --rv-blue:#60a5fa;        /* aproximação do blue-400 */
          --rv-gray-50:#f9fafb;
          --rv-gray-100:#f3f4f6;
          --rv-gray-200:#e5e7eb;
          --rv-gray-400:#9ca3af;
          --rv-text:#0b1a2b;
        }

        .rv-catalog{
          animation: rvFadeIn 240ms ease-out;
          padding: 48px 16px 80px;
        }
        @keyframes rvFadeIn{
          from{opacity:0; transform:translateY(4px);}
          to{opacity:1; transform:translateY(0);}
        }

        .rv-container{
          max-width: 1240px;
          margin: 0 auto;
        }

        .rv-title{
          text-align:center;
          font-family: ui-serif, Georgia, 'Times New Roman', serif;
          letter-spacing: clamp(.08em, 4vw, .18em);
          font-weight: 500;
          color: var(--rv-text);
          font-size: clamp(31px, 10vw, 42px);
          line-height: 1.05;
          margin: 12px 0 40px;
          overflow-wrap: anywhere;
        }

        .rv-shell{
          display:flex;
          gap: 48px;
          align-items:flex-start;
        }

        /* Sidebar wrapper animado */
        .rv-sidebarWrap{
          flex-shrink:0;
          overflow:hidden;
          transition: width 500ms ease, opacity 500ms ease;
          width: 0px;
          opacity: 0;
        }
        .rv-sidebarWrap.open{
          width: 260px;
          opacity: 1;
        }
        .rv-sidebar{
          width: 260px;
          padding-right: 24px;
          padding-bottom: 80px;
          position: sticky;
          top: 128px;
        }

        .rv-sectionTitle{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--rv-text);
          padding-bottom: 10px;
          border-bottom: 1px solid var(--rv-gray-100);
          margin-bottom: 14px;
        }

        .rv-categoryList{
          display:flex;
          flex-direction:column;
          gap: 10px;
          margin-bottom: 28px;
        }

        .rv-catLabel{
          position: relative;
          display:flex;
          align-items:center;
          cursor:pointer;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #6b7280; /* gray-500 */
          transition: transform 180ms ease, color 180ms ease;
          user-select:none;
        }
        .rv-catLabel:hover{
          color: var(--rv-blue);
          transform: translateX(4px);
        }
        .rv-catLabel.active{
          color: var(--rv-blue);
        }
        .rv-catRadio{
          position:absolute;
          opacity:0;
          pointer-events:none;
        }

        /* Accordion */
        .rv-accordion{
          border-top: 1px solid var(--rv-gray-100);
          padding: 16px 0;
        }
        .rv-accBtn{
          width:100%;
          display:flex;
          justify-content:space-between;
          align-items:center;
          background:transparent;
          border:0;
          padding:0;
          cursor:pointer;
        }
        .rv-accTitle{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--rv-text);
          transition: color 180ms ease;
        }
        .rv-accBtn:hover .rv-accTitle{
          color: var(--rv-blue);
        }
        .rv-accPanel{
          overflow:hidden;
          transition: max-height 300ms ease, opacity 300ms ease, margin-top 300ms ease;
          max-height: 0;
          opacity: 0;
          margin-top: 0;
        }
        .rv-accPanel.open{
          max-height: 240px;
          opacity: 1;
          margin-top: 12px;
        }
        .rv-priceRow{
          display:flex;
          align-items:center;
          gap: 12px;
          margin: 10px 0;
          cursor:pointer;
          user-select:none;
        }
        .rv-priceInput{
          appearance:none;
          width: 14px;
          height: 14px;
          border: 1px solid var(--rv-gray-200);
          background: #fff;
          border-radius: 0;
          display:inline-block;
        }
        .rv-priceInput:checked{
          background: var(--rv-dark);
          border-color: var(--rv-dark);
        }
        .rv-priceLabel{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #6b7280;
        }

        /* Main / top bar */
        .rv-main{
          flex:1;
          display:flex;
          flex-direction:column;
          min-width: 0;
        }
        .rv-topbar{
          display:flex;
          flex-direction:column;
          gap: 12px;
          justify-content:space-between;
          align-items:center;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--rv-gray-100);
          position: relative;
          z-index: 10;
          background: #fff;
        }
        @media (min-width: 768px){
          .rv-topbar{ flex-direction:row; gap: 16px; }
        }

        .rv-filterBtn{
          display:flex;
          align-items:center;
          gap: 10px;
          background: transparent;
          border: 0;
          padding: 0;
          cursor: pointer;
          transition: opacity 180ms ease;
        }
        .rv-filterBtn:hover{ opacity:.7; }

        .rv-filterText{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: var(--rv-text);
        }

        .rv-searchWrap{
          width: 100%;
          max-width: 260px;
        }
        .rv-searchBox{
          display:flex;
          align-items:center;
          gap: 8px;
          background: var(--rv-gray-50);
          border: 1px solid var(--rv-gray-200);
          padding: 4px 14px;
          transition: border-color 180ms ease;
        }
        .rv-searchBox:focus-within{
          border-color: var(--rv-blue);
        }
        .rv-searchInput{
          width:100%;
          border:0;
          outline:none;
          background:transparent;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--rv-text);
        }
        .rv-searchInput::placeholder{
          color: var(--rv-gray-400);
        }

        /* Grid responsivo igual ao AI Studio */
        .rv-grid{
          margin-top: 34px;
          display:grid;
          grid-template-columns: 1fr;
          gap: 64px 32px;
          transition: all 500ms ease;
        }
        @media (min-width: 768px){
          .rv-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        /* fechado: lg=3 colunas */
        @media (min-width: 1024px){
          .rv-grid.closed{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .rv-grid.open{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        /* aberto: xl=3 colunas */
        @media (min-width: 1280px){
          .rv-grid.open{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        /* Card */
        .rv-card{
          display:flex;
          flex-direction:column;
          align-items:center;
        }
        .rv-imgWrap{
          width:100%;
          aspect-ratio: 1 / 1;
          background: var(--rv-gray-100);
          overflow:hidden;
          position:relative;
          cursor:pointer;
          margin-bottom: 22px;
        }
        .rv-img{
          width:100%;
          height:100%;
          object-fit:cover;
          transition: transform 500ms ease;
        }
        .rv-imgWrap:hover .rv-img{
          transform: scale(1.05);
        }

        .rv-badge{
          position:absolute;
          top: 14px;
          right: 14px;
          background: var(--rv-dark);
          color:#fff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: .16em;
          text-transform: uppercase;
          padding: 6px 10px;
        }


        .rv-overlay{
          position:absolute;
          inset:0;
          background: rgba(11, 26, 43, 0.40); /* aproximação do revissant-dark/40 */
          opacity:0;
          transition: opacity 300ms ease;
          display:flex;
          align-items:center;
          justify-content:center;
          pointer-events:none;
        }

        .rv-imgWrap:hover .rv-overlay{
          opacity:1;
        }

        .rv-overlayText{
          color:#fff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: .16em;
          text-transform: uppercase;
          text-shadow: 0 2px 10px rgba(0,0,0,.25);
        }

        .rv-info{
          text-align:center;
          width:100%;
        }
        .rv-name{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: .10em;
          text-transform: uppercase;
          color: var(--rv-text);
          margin: 0 0 6px;
        }
        .rv-nameLink{
          display:block;
          color: inherit;
          text-decoration: none;
        }
        .rv-price{
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          color: var(--rv-text);
          margin: 0 0 12px;
        }
        .rv-btn{
          display:inline-block;
          background:#000;
          color:#fff;
          border:0;
          padding: 8px 16px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
          transition: background 180ms ease;
          cursor: pointer;
          user-select:none;
        }
        .rv-btn:hover{
          background: var(--rv-blue);
        }
        .rv-btn:disabled{
          opacity: .65;
          cursor: not-allowed;
        }

        /* Pagination */
        .rv-pagination{
          display:flex;
          justify-content:center;
          align-items:center;
          gap: 14px;
          margin-top: 70px;
          color: var(--rv-text);
        }
        .rv-pageNum{
          width: 32px;
          text-align:center;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          font-weight: 800;
          font-size: 18px;
        }
        .rv-pageBtn{
          background:transparent;
          border:0;
          padding: 6px;
          cursor:pointer;
          transition: transform 180ms ease, opacity 180ms ease;
          color: var(--rv-text);
        }
        .rv-pageBtn:hover{ transform: translateX(2px); }
        .rv-pageBtn.prev:hover{ transform: translateX(-2px); }
        .rv-pageBtn[disabled]{ opacity:0; cursor:default; }
      `}</style>

      <div className="rv-container">
        <h1 className="rv-title">CATALOGUE</h1>

        <div className="rv-shell">
          {/* Sidebar animada */}
          <div className={`rv-sidebarWrap ${isFilterOpen ? 'open' : ''}`}>
            <div className="rv-sidebar">
              <div className="rv-sectionTitle">CATEGORIES</div>

              <Form method="get" onChange={onAutoSubmit}>
                <div className="rv-categoryList">
                  {/* All */}
                  <label
                    className={`rv-catLabel ${!selectedTag ? 'active' : ''}`}
                  >
                    <input
                      className="rv-catRadio"
                      type="radio"
                      name="tag"
                      value=""
                      defaultChecked={!selectedTag}
                    />
                    ALL
                  </label>

                  {TAGS.map((t) => (
                    <label
                      key={t.value}
                      className={`rv-catLabel ${
                        selectedTag === t.value ? 'active' : ''
                      }`}
                    >
                      <input
                        className="rv-catRadio"
                        type="radio"
                        name="tag"
                        value={t.value}
                        defaultChecked={selectedTag === t.value}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>

                {/* Accordion Shop by price */}
                <div className="rv-accordion">
                  <button
                    type="button"
                    className="rv-accBtn"
                    onClick={() => setIsPriceOpen((v) => !v)}
                  >
                    <span className="rv-accTitle">SHOP BY PRICE</span>
                    <span style={{color: 'var(--rv-text)'}}>
                      {isPriceOpen ? '▴' : '▾'}
                    </span>
                  </button>

                  <div className={`rv-accPanel ${isPriceOpen ? 'open' : ''}`}>
                    {PRICE_RANGES.map((r) => (
                      <label key={r.value || 'any'} className="rv-priceRow">
                        <input
                          className="rv-priceInput"
                          type="radio"
                          name="price"
                          value={r.value}
                          defaultChecked={(selectedPriceRange || '') === r.value}
                        />
                        <span className="rv-priceLabel">
                          {r.value ? r.label : 'ANY'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </Form>
            </div>
          </div>

          {/* Main */}
          <div className="rv-main">
            <div className="rv-topbar">
              <button
                type="button"
                className="rv-filterBtn"
                onClick={() => setIsFilterOpen((v) => !v)}
              >
                {/* icon semelhante ao SlidersHorizontal */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{color: 'var(--rv-text)'}}
                >
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>

                <span className="rv-filterText">
                  {isFilterOpen ? 'HIDE FILTERS' : 'SHOW FILTERS'}
                </span>
              </button>

              <div className="rv-searchWrap">
                <div className="rv-searchBox">
                  {/* icon Search */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{color: 'var(--rv-gray-400)'}}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>

                  <input
                    className="rv-searchInput"
                    placeholder="SEARCH..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Grid */}
            {current.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 0',
                  color: 'var(--rv-gray-400)',
                  letterSpacing: '.14em',
                  fontFamily:
                    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                NO PRODUCTS FOUND
              </div>
            ) : (
              <div
                className={`rv-grid ${isFilterOpen ? 'open' : 'closed'}`}
              >
                {current.map((p: CatalogProduct) => {
                  const isNew = (p.tags ?? []).includes('new');
                  const imgUrl = p.image?.url ?? '';
                  const alt = p.image?.altText ?? p.title;
                  const selectedVariant = p.selectedVariant;
                  const isAvailable = Boolean(selectedVariant?.availableForSale);
                  const buttonText = isAvailable ? 'ADD TO CART' : 'SOLD OUT';

                  return (
                    <div key={p.id} className="rv-card">
                      <div
                        className="rv-imgWrap"
                        onClick={() => navigate(getProductPath(p.handle))}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') navigate(getProductPath(p.handle));
                        }}
                      >
                        {imgUrl ? (
                          <img className="rv-img" src={imgUrl} alt={alt} />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: 'var(--rv-gray-100)',
                            }}
                          />
                        )}

                        {isNew ? <div className="rv-badge">NEW</div> : null}

                        <div className="rv-overlay">
                            <div className="rv-overlayText">BUY NOW</div>
                        </div>
                      </div>

                      <div className="rv-info">
                        <Link
                          to={getProductPath(p.handle)}
                          className="rv-nameLink"
                        >
                          <h3 className="rv-name">{p.title}</h3>
                        </Link>
                        <p className="rv-price">
                          {formatMoney(
                            p.minPrice.amount,
                            p.minPrice.currencyCode,
                          )}
                        </p>

                        <AddToCartButton
                          buttonAriaLabel={`${buttonText} ${p.title}`}
                          buttonClassName="rv-btn"
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

                        {/* link discreto para debug (podes remover depois) */}
                        <div style={{marginTop: 10, opacity: 0.0}}>
                          <Link to={getProductPath(p.handle)}>Open</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 ? (
              <div className="rv-pagination">
                <button
                  className="rv-pageBtn prev"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>

                <div className="rv-pageNum">{page}.</div>

                <button
                  className="rv-pageBtn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
