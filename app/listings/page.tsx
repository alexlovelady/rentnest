import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ListingFilters } from "./listing-filters";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rental Listings",
  description: "Browse available rental units listed on RentNest.",
  robots: { index: true, follow: true },
};

interface SearchParams { beds?: string; maxRent?: string; sort?: string; location?: string }

export default async function ListingsMarketplacePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { beds, maxRent, sort = "newest", location = "" } = await searchParams;

  const minBeds = beds ? parseInt(beds) : undefined;
  const maxRentNum = maxRent ? parseFloat(maxRent) : undefined;
  const locationQuery = location.trim().toLowerCase();

  const allActive = await prisma.listing.findMany({
    where: { status: "active" },
    include: {
      unit: {
        include: {
          property: { select: { city: true, state: true, zip: true, photoUrl: true, address: true } },
        },
      },
    },
  });

  // Filter
  let listings = allActive.filter((l) => {
    if (minBeds !== undefined && l.unit.bedrooms < minBeds) return false;
    if (maxRentNum !== undefined && l.askingRent > maxRentNum) return false;
    if (locationQuery) {
      const { city, state, zip } = l.unit.property;
      const haystack = `${city} ${state} ${zip}`.toLowerCase();
      if (!haystack.includes(locationQuery)) return false;
    }
    return true;
  });

  // Sort
  listings.sort((a, b) => {
    if (sort === "rent_asc") return a.askingRent - b.askingRent;
    if (sort === "rent_desc") return b.askingRent - a.askingRent;
    if (sort === "beds_desc") return b.unit.bedrooms - a.unit.bedrooms;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const maxRentCeiling = allActive.length ? Math.max(...allActive.map((l) => l.askingRent)) : 5000;

  // Unique locations for quick-select chips
  const locations = Array.from(
    new Map(
      allActive.map((l) => [`${l.unit.property.city}-${l.unit.property.state}`, { city: l.unit.property.city, state: l.unit.property.state }])
    ).values()
  ).sort((a, b) => a.city.localeCompare(b.city));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/"><img src="/logo.jpg" alt="RentNest" className="h-9 w-auto" /></Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700">Landlord sign in</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-dark mb-1">Available Rentals</h1>
          <p className="text-gray-500">{listings.length} of {allActive.length} unit{allActive.length !== 1 ? "s" : ""} shown</p>
        </div>

        <Suspense>
          <ListingFilters maxRentCeiling={maxRentCeiling} locations={locations} />
        </Suspense>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-700 mb-1">No listings match your filters</h3>
            <p className="text-sm text-gray-500">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="w-full h-44 bg-gray-100 overflow-hidden">
                  {listing.unit.property.photoUrl ? (
                    <img
                      src={listing.unit.property.photoUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{listing.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{listing.unit.property.city}, {listing.unit.property.state}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(listing.askingRent)}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <p className="text-xs text-gray-400">
                      {listing.unit.bedrooms}bd · {listing.unit.bathrooms}ba
                      {listing.unit.squareFeet ? ` · ${listing.unit.squareFeet} sqft` : ""}
                    </p>
                  </div>
                  {listing.availableAt && (
                    <p className="text-xs text-gray-400 mt-1">Available {formatDate(listing.availableAt)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
