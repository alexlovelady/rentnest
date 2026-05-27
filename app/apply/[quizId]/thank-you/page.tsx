import { CheckCircle2 } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <CheckCircle2 size={52} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-dark mb-2">Application submitted!</h1>
        <p className="text-gray-500 text-sm">
          Your pre-screening application has been received. The landlord will review it and reach out to you by email.
        </p>
        <img src="/logo.jpg" alt="RentNest" className="h-8 w-auto mx-auto mt-8 opacity-40" />
      </div>
    </div>
  );
}
