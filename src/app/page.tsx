import BookingFilter from "../components/bokingFilters";
import Hero from "../components/hero";
import PropertyList from "../components/propertyList";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />  
      <Hero />
      <BookingFilter />
      <PropertyList />
      <Footer />
    </main>
  );
}
