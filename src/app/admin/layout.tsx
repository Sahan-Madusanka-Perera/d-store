/**
 * Admin shell.
 *
 * Exists to carry `admin-light`, which pins the whole panel to the light palette no
 * matter what the storefront's theme toggle is set to — see the `.admin-light` rules in
 * globals.css. The admin was built light-only (hundreds of hardcoded gray/white
 * utilities, no dark: variants) on top of shadcn components that do follow the theme,
 * so in dark mode the two halves disagreed and labels landed around 1.4:1.
 *
 * Pinning here rather than on each page means /admin, /admin/discounts, /admin/orders
 * and /admin/newsletter are all covered, including any admin route added later.
 *
 * If the panel ever gets a proper dark treatment, delete this wrapper's class and the
 * two `.admin-light` rules in globals.css; nothing else depends on it.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-light min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
