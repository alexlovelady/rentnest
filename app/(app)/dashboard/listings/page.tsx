import { requireServerUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Megaphone, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { NewListingModal } from "./new-listing-modal";
import { ListingStatusSelect, DeleteListingButton } from "./listing-actions-menu";
import { CopyLinkButton } from "../screening/copy-link-button";
import { PLAN_LIMITS } from "@/lib/stripe";

export default async function ListingsPage() {
  const user = await requireServerUser();

  const [listings, vacantUnits, quizzes] = await Promise.all([
    prisma.listing.findMany({
      where: { landlordId: user.id },
      include: {
        unit: { include: { property: { select: { nickname: true, photoUrl: true } } } },
        quiz: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Vacant units = no active lease, and no active listing yet
    prisma.unit.findMany({
      where: {
        isActive: true,
        property: { landlordId: user.id, isActive: true },
        leases: { none: { status: "active" } },
        listings: { none: { status: "active" } },
      },
      include: { property: { select: { nickname: true } } },
    }),
    prisma.screeningQuiz.findMany({
      where: { landlordId: user.id, isActive: true },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const canList = (PLAN_LIMITS[user.plan] ?? 0) > 0;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark">Listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Publicly listed units on the{" "}
            <a href={`${APP_URL}/listings`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
              RentNest marketplace <ExternalLink size={11} />
            </a>
          </p>
        </div>
        {canList ? (
          <NewListingModal vacantUnits={vacantUnits} quizzes={quizzes} />
        ) : (
          <Link href="/dashboard/settings" className="text-sm text-primary hover:underline">Upgrade to list units</Link>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No listings yet</h3>
          <p className="text-sm text-gray-500 mb-4">List a vacant unit to appear on the public marketplace.</p>
          {canList && <NewListingModal vacantUnits={vacantUnits} quizzes={quizzes} />}
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => {
            const listingUrl = `${APP_URL}/listings/${listing.id}`;
            return (
              <div key={listing.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {listing.unit.property.photoUrl ? (
                      <img src={listing.unit.property.photoUrl} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-lg shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{listing.title}</p>
                      <p className="text-xs text-gray-500">
                        Unit {listing.unit.unitNumber} · {listing.unit.bedrooms}bd/{listing.unit.bathrooms}ba
                        {listing.unit.squareFeet ? ` · ${listing.unit.squareFeet} sqft` : ""}
                      </p>
                      <p className="text-sm font-medium text-gray-800 mt-1">{formatCurrency(listing.askingRent)}/mo</p>
                      {listing.availableAt && (
                        <p className="text-xs text-gray-400">Available {formatDate(listing.availableAt)}</p>
                      )}
                      {listing.quiz && (
                        <p className="text-xs text-primary mt-1">Quiz: {listing.quiz.title}</p>
                      )}
                    </div>
                  </div>
                  <ListingStatusSelect listingId={listing.id} status={listing.status} />
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                  <CopyLinkButton url={listingUrl} />
                  <span className="text-xs text-gray-300">·</span>
                  <a href={listingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors">
                    <ExternalLink size={11} /> View public listing
                  </a>
                  <span className="text-xs text-gray-300">·</span>
                  <DeleteListingButton listingId={listing.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
