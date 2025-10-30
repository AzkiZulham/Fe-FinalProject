import PropertyCard from "./propertyCard";

interface CatalogProperty {
  id: number;
  name: string;
  address?: string;
  picture?: string;
  price?: number | null;
  availableRooms?: number;
  rating?: number;
  reviewCount?: number;
}

interface Props {
  properties: CatalogProperty[];
}

export default function PropertyList({ properties }: Props) {
  if (!properties.length)
    return (
      <p className="text-gray-500 text-center mt-12">
        No properties found matching your criteria.
      </p>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
