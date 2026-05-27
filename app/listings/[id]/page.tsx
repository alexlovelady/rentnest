import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Home, Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { id, status: "active" },
    select: { title: true, askingRent: true },
  });
  if (!listing) return { title: "Listing Not Found" };
  return {
    title: `${listing.title} — ${formatCurrency(listing.askingRent)}/mo`,
    robots: { index: true, follow: true },
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, status: "active" },
    include: {
      unit: {
        include: {
          property: {
            select: {
              nickname: true,
              address: true,
              address2: true,
              city: true,
              state: true,
              zip: true,
              photoUrl: true,
              propertyType: true,
            },
          },
        },
      },
      quiz: { select: { id: true } },
      landlord: { select: { name: true } },
    },
  });

  if (!listing) notFound();

  const { unit } = listing;
  const { property } = unit;
  const hasQuiz = !!listing.quiz;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/"><img src="/logo.jpg" alt="RentNest" className="h-9 w-auto" /></Link>
          <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-700">← All listings</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Photo banner */}
        {property.photoUrl ? (
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
            <img src={property.photoUrl} alt={listing.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-40 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
            <Home size={40} className="text-gray-300" />
          </div>
        )}

        <div className="grid md:grid-cols-[1fr,320px] gap-8">
          {/* Main info */}
          <div>
            <h1 className="text-2xl font-bold text-slate-dark mb-1">{listing.title}</h1>
            <p className="flex items-center gap-1 text-sm text-gray-500 mb-4">
              <MapPin size={13} />
              {property.address}{property.address2 ? `, ${property.address2}` : ""}, {property.city}, {property.state} {property.zip}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-700">
              <span className="bg-gray-100 px-3 py-1.5 rounded-full">{unit.bedrooms} bedroom{unit.bedrooms !== 1 ? "s" : ""}</span>
              <span className="bg-gray-100 px-3 py-1.5 rounded-full">{unit.bathrooms} bathroom{unit.bathrooms !== 1 ? "s" : ""}</span>
              {unit.squareFeet && <span className="bg-gray-100 px-3 py-1.5 rounded-full">{unit.squareFeet.toLocaleString()} sqft</span>}
              <span className="bg-gray-100 px-3 py-1.5 rounded-full capitalize">{property.propertyType.replace(/_/g, " ")}</span>
            </div>

            {listing.description && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">About this unit</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            <div className="text-xs text-gray-400">
              Managed by {listing.landlord.name} via RentNest
            </div>
          </div>

          {/* Apply card */}
          <div className="md:sticky md:top-8 h-fit">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-2xl font-bold text-gray-900 mb-0.5">
                {formatCurrency(listing.askingRent)}<span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              {listing.availableAt && (
                <p className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <Calendar size={13} /> Available {formatDate(listing.availableAt)}
                </p>
              )}

              {hasQuiz ? (
                <>
                  <Link
                    href={`/apply/${listing.quiz!.id}`}
                    className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-medium rounded-xl py-3 text-sm transition-colors mb-3"
                  >
                    Apply Now
                  </Link>
                  <div className="space-y-1.5">
                    {["No account needed", "Takes about 5 minutes", "Landlord reviews and contacts you"].map((item) => (
                      <p key={item} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle2 size={12} className="text-green-500 shrink-0" /> {item}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Contact the landlord to apply for this unit.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
