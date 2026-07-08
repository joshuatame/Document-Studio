import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center" padding="lg">
        <h1 className="text-4xl font-bold text-navy">404</h1>
        <p className="mt-2 text-graphite/80">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-electric px-4 text-sm font-medium text-white hover:bg-electric/90"
        >
          Return to dashboard
        </Link>
      </Card>
    </div>
  );
}
