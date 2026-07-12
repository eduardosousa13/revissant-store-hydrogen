import {Link, useParams} from 'react-router';
import {
  CartForm,
  Image,
  Money,
  useOptimisticCart,
  type OptimisticCartLine,
} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

import {ShoppingBagIcon, TrashIcon, XIcon} from '~/components/revissant/ui/icons';
import {getLocalePathPrefix} from '~/components/revissant/utils/getLocalePathPrefix';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

type RevissantCartPageProps = {
  cart: CartApiQueryFragment | null;
};

export function RevissantCartPage({cart: originalCart}: RevissantCartPageProps) {
  const {locale} = useParams();
  const cart = useOptimisticCart(originalCart);
  const lines = (cart?.lines?.nodes ?? []) as CartLine[];
  const hasItems = lines.length > 0;
  const totalQuantity = cart?.totalQuantity ?? 0;
  const homePath = getLocalePathPrefix(locale) || '/';

  return (
    <section className="bg-white revissant-page-offset">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="max-w-3xl mx-auto bg-white shadow-2xl border border-gray-100">
          <div className="p-6 flex justify-between items-center border-b border-gray-100 h-20">
            <span className="font-sans font-bold text-xl tracking-widest text-revissant-dark flex items-center gap-2">
              CART{' '}
              <span className="text-sm font-sans bg-revissant-dark text-white rounded-none w-6 h-6 flex items-center justify-center">
                {totalQuantity}
              </span>
            </span>
            <Link
              to={homePath}
              className="p-2 hover:bg-gray-100 rounded-none transition-colors"
              aria-label="Close cart"
            >
              <XIcon size={24} className="text-revissant-dark" />
            </Link>
          </div>

          <div className="flex flex-col">
            {!hasItems ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 py-16">
                <ShoppingBagIcon size={48} />
                <p className="text-lg">Your cart is empty</p>
                <Link
                  to={homePath}
                  className="text-revissant-dark underline hover:text-blue-400"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {lines.map((line) => {
                    const merchandise = line.merchandise;
                    const image = merchandise?.image;
                    const productTitle =
                      merchandise?.product?.title ?? 'Product';
                    const colorLabel = getColorLabel(line);
                    const quantity = line.quantity ?? 0;

                    return (
                      <div key={line.id} className="flex gap-4">
                        {image ? (
                          <Image
                            data={image}
                            alt={image.altText || productTitle}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-none bg-gray-100"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-100" />
                        )}

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-revissant-dark">
                              {productTitle}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {colorLabel}
                            </p>
                          </div>
                          <div className="flex justify-between items-end">
                            <CartLinePrice quantity={quantity} line={line} />
                            <CartForm
                              route="/cart"
                              action={CartForm.ACTIONS.LinesRemove}
                              inputs={{lineIds: [line.id]}}
                            >
                              <button
                                type="submit"
                                className="text-red-400 hover:text-red-600 p-1"
                                aria-label="Remove item"
                                disabled={Boolean(line.isOptimistic)}
                              >
                                <TrashIcon size={18} />
                              </button>
                            </CartForm>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-xl font-bold text-revissant-dark">
                      {cart?.cost?.subtotalAmount ? (
                        <Money data={cart.cost.subtotalAmount} />
                      ) : (
                        '-'
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 text-center">
                    Shipping & taxes calculated at checkout
                  </p>
                  {cart?.checkoutUrl ? (
                    <a
                      href={cart.checkoutUrl}
                      target="_self"
                      className="block text-center w-full bg-revissant-dark text-white py-4 font-bold tracking-wider hover:bg-gray-800 transition-colors uppercase rounded-none"
                    >
                      Proceed to Checkout
                    </a>
                  ) : (
                    <button
                      className="w-full bg-gray-300 text-gray-600 py-4 font-bold tracking-wider uppercase rounded-none cursor-not-allowed"
                      disabled
                    >
                      Proceed to Checkout
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getColorLabel(line: CartLine) {
  const options = line.merchandise?.selectedOptions ?? [];
  const color = options.find((option) =>
    option.name.toLowerCase().includes('color'),
  )?.value;
  return color || options[0]?.value || 'Standard';
}

function CartLinePrice({
  line,
  quantity,
}: {
  line: CartLine;
  quantity: number;
}) {
  const unitAmount = line.cost?.amountPerQuantity;
  const totalAmount = line.cost?.totalAmount;

  if (!unitAmount) {
    return <span className="font-medium text-revissant-dark">-</span>;
  }

  if (quantity <= 1 || !totalAmount) {
    return (
      <span className="font-medium text-revissant-dark">
        <Money data={totalAmount ?? unitAmount} />
      </span>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-revissant-dark">
      <Money data={unitAmount} />
      <span className="inline-flex items-center justify-center bg-revissant-dark px-2 py-0.5 text-xs font-bold tracking-wide text-white">
        x{quantity}
      </span>
      <span className="text-gray-400">=</span>
      <span className="font-bold">
        <Money data={totalAmount} />
      </span>
    </span>
  );
}
