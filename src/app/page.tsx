import BookingFilter from "@/components/bokingFilters";
import Hero from "@/components/hero";
import PropertyList from "@/components/propertyList";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <BookingFilter />
      <PropertyList />
      <Footer />
    </main>
  );
}
