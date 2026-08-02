'use client';

import { useCartStore } from '@/store/cart';
import Image from 'next/image';
import Link from 'next/link';
import { SHIPPING_RATES } from '@/lib/constants';
import { ShoppingBag, ShoppingCart, Tag, Trash2, Minus, Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Cart.
 *
 * Two structural faults were fixed here rather than restyled around: the order summary
 * sat *outside* the grid it was meant to occupy, so `lg:col-span-1` did nothing and it
 * stacked full-width underneath the items; and the page had no container, so every row
 * ran flush into the viewport edge. The (shop) layout supplies no gutter, so each page
 * brings its own — this one matches the catalogue's max-w-7xl.
 *
 * Prices are solid and tabular. They were gradient-clipped to `accent`, which resolves
 * to 90% white in the light theme, so the last digits of every total faded out.
 */
export default function CartPage() {
  const {
    items,
    totalItems,
    totalAmount,
    discountTotal,
    appliedDiscounts,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartStore();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price);

  const shippingCost =
    totalAmount >= SHIPPING_RATES.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATES.OTHER_PROVINCES;
  const finalTotal = totalAmount - discountTotal + shippingCost;
  const awayFromFreeShipping = SHIPPING_RATES.FREE_SHIPPING_THRESHOLD - totalAmount;

  const shell = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

  if (items.length === 0) {
    return (
      <div className={`${shell} py-20 text-center sm:py-28`}>
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Your cart is empty
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-pretty text-muted-foreground">
          Manga, figures and apparel are waiting. Find something worth queuing for.
        </p>
        <Button size="lg" asChild className="mt-8">
          <Link href="/products">
            <ShoppingBag className="mr-2 h-5 w-5" aria-hidden="true" />
            Start shopping
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`${shell} py-8 sm:py-10`}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Shopping cart
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button
          onClick={clearCart}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          Clear cart
        </Button>
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* One panel of divided rows, not a stack of floating cards — the lines belong
            to a single list, and dividers say that with less furniture than borders. */}
        <section className="lg:col-span-2" aria-label="Items in your cart">
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {items.map(item => (
              <li key={item.id} className="p-4 transition-colors hover:bg-muted/40 sm:p-5">
                <div className="flex gap-4 sm:gap-5">
                  <Link
                    href={`/products/${item.productId}`}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24"
                  >
                    <Image
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.productId}`}
                        className="line-clamp-2 text-sm font-semibold text-foreground hover:underline sm:text-base"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 text-xs capitalize text-muted-foreground sm:text-sm">
                        {item.product.category}
                      </p>

                      {(item.selectedSize || item.selectedColor) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.selectedSize && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              Size {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              {item.selectedColor}
                            </span>
                          )}
                        </div>
                      )}

                      {item.product.discountEligible && (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                          Discount eligible
                        </p>
                      )}
                    </div>

                    {/* One horizontal band on every breakpoint: stepper, then money in a
                        fixed-width right-aligned slot so the totals form a clean column
                        down the list, then remove. Stacking these vertically padded each
                        row out to ~180px for three short controls. */}
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:gap-5">
                      <div className="flex items-center rounded-lg border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-l-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span
                          aria-live="polite"
                          className="w-10 text-center text-sm font-semibold tabular-nums text-foreground"
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.product.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-r-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="text-right sm:min-w-[7rem]">
                        <div className="text-base font-bold tabular-nums text-foreground">
                          {formatPrice(item.priceAtTime * item.quantity)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs tabular-nums text-muted-foreground">
                            {formatPrice(item.priceAtTime)} each
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* top-32 clears the two fixed header bars, same as the product gallery. */}
        <aside className="lg:sticky lg:top-32">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground">Order summary</h2>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">
                  Subtotal · {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {formatPrice(totalAmount)}
                </dd>
              </div>

              {appliedDiscounts.map((discount, index) => (
                <div key={index} className="flex items-baseline justify-between gap-4">
                  <dt className="flex min-w-0 items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{discount.description}</span>
                  </dt>
                  <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    −{formatPrice(discount.amountOff)}
                  </dd>
                </div>
              ))}

              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="font-semibold tabular-nums text-foreground">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-400">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </dd>
              </div>
            </dl>

            {awayFromFreeShipping > 0 && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-xs text-muted-foreground">
                <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(awayFromFreeShipping)}
                  </span>{' '}
                  more for free delivery
                </span>
              </p>
            )}

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-4">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-xl font-bold tabular-nums text-foreground">
                {formatPrice(finalTotal)}
              </span>
            </div>

            <div className="mt-5 space-y-2.5">
              <Button size="lg" asChild className="w-full">
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full">
                <Link href="/products">Continue shopping</Link>
              </Button>
            </div>

            <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
              Paid by bank transfer. Details follow at checkout.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
