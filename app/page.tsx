import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/homePage/HeroSection';
import { WhyChooseUs } from '@/components/homePage/WhyChooseUs';
import { BestSeller } from '@/components/homePage/BestSeller';
import { Menu } from '@/components/homePage/Menu';
import { AboutUs } from '@/components/homePage/AboutUs';
import { Advertisement } from '@/components/homePage/Advertisement';
export default function Home() {
  return (
    <div className="relative w-full">
      <Navbar />
      <main>
        <HeroSection />
        <WhyChooseUs />
        <BestSeller />
        <Menu />
        <AboutUs />
        <Advertisement />
      </main>
      <Footer />
    </div>
  );
}
