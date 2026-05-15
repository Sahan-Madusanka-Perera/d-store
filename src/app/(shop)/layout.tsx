import Navbar from '@/components/layout/Navbar';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-28 sm:pt-36 pb-8">
        {children}
      </main>
    </div>
  );
}