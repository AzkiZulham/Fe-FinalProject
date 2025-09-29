import BookingFilter from "../components/bokingFilters";
import Hero from "../components/hero";
import PropertyList from "../components/propertyList";


export default function HomePage() {
  return (
    <main>
      <Hero />
      <BookingFilter />
      <PropertyList />
    </main>
  );
}
