import { cn } from '@/lib/utils';

/**
 * One vocabulary for every small label that names a product's state, its value, or
 * where it lives in the catalogue.
 *
 * These used to be invented per surface. The product card had seven saturated pills;
 * the detail page had a four-way gradient ramp for the category (indigo, violet, amber,
 * teal), tinted plates for status, and a rose gradient for the discount. None of those
 * hues appear in globals.css, which is 0% saturation end to end — so a shopper learned
 * nothing from "purple", and with three pills stacked at once nothing read as more
 * important than anything else.
 *
 * So: no hue, no icon, no shadow, no gradient. Weight is the only hierarchy, and it is
 * ranked by what the label does to a purchase decision:
 *
 *   ink    the one fact that changes how you buy — running out, gated, marked down
 *   plate  state you should know but cannot act on — coming soon, pre-order, sold out
 *   ghost  taxonomy — where the product sits, not something to do
 *
 * `surface` picks the ground the chip is standing on. Over a photograph the fills have
 * to be translucent with a backdrop blur, which is honest depth in a way a box-shadow on
 * an 18px pill is not; on the page itself they are solid, because there is nothing
 * behind them worth showing through.
 */

export type ChipTone = 'ink' | 'plate' | 'ghost';
export type ChipSurface = 'page' | 'media';
export type ChipSize = 'sm' | 'md';

const BASE =
  'inline-flex items-center rounded-md font-semibold uppercase leading-none';

const SIZES: Record<ChipSize, string> = {
  // Over a 4:5 thumbnail, where the chip must not out-shout the product.
  sm: 'px-2 py-[3px] text-[10px] tracking-[0.08em]',
  // On the detail page, where the row sits above a 36px headline and 10px reads timid.
  md: 'px-2.5 py-[5px] text-[11px] tracking-[0.09em]',
};

const TONES: Record<ChipSurface, Record<ChipTone, string>> = {
  page: {
    ink: 'bg-foreground text-background',
    plate: 'bg-secondary text-foreground ring-1 ring-inset ring-foreground/10',
    ghost: 'text-muted-foreground ring-1 ring-inset ring-border',
  },
  media: {
    ink: 'bg-foreground text-background',
    plate:
      'bg-background/95 backdrop-blur-md text-foreground ring-1 ring-inset ring-foreground/10',
    ghost:
      'bg-background/95 backdrop-blur-md text-foreground/70 ring-1 ring-inset ring-foreground/10',
  },
};

export function chip(
  tone: ChipTone,
  {
    surface = 'page',
    size = 'md',
    className,
  }: { surface?: ChipSurface; size?: ChipSize; className?: string } = {}
) {
  return cn(BASE, SIZES[size], TONES[surface][tone], className);
}

/**
 * Numbers inside a chip: percentages and counts. Letter-spacing built for uppercase
 * words spreads digits apart, and proportional figures make "-9%" and "-19%" jitter
 * against each other down a grid of cards.
 */
export const CHIP_NUMERIC = 'tracking-normal tabular-nums';
