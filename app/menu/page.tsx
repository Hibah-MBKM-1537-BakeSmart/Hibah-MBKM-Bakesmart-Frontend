import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MenuHero } from '@/components/menuPage/MenuHero';
import { MenuGrid } from '@/components/menuPage/MenuGrid';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <MenuHero />
        <MenuGrid />
      </main>
      <Footer />
    </div>
  );
}
