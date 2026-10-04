import { Link, useNavigate, useParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentCancelledPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center" padding="lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-alert/10">
          <XCircle className="h-8 w-8 text-alert" />
        </div>
        <h1 className="text-2xl font-bold text-navy">Payment cancelled</h1>
        <p className="mt-2 text-graphite/80">
          Your payment was not completed. You can return to checkout when ready.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => navigate(`/payment/${documentId}`)}>
            Return to payment
          </Button>
          <Link
            to="/"
            className="text-sm font-medium text-electric hover:underline"
          >
            Return to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
