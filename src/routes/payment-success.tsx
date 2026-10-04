import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPaymentStatus } from "@/lib/api";

export default function PaymentSuccessPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      try {
        const status = await getPaymentStatus(documentId);
        if (status.paymentStatus === "paid" || status.paymentStatus === "not_required") {
          navigate(`/generating/${documentId}`, { replace: true });
        }
      } catch {
        // Stay on success page; user can retry manually
      }
    }
    if (documentId) void verify();
  }, [documentId, navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center" padding="lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-navy">Payment successful</h1>
        <p className="mt-2 text-graphite/80">
          Thank you. Your payment has been received and document generation will
          begin shortly.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => navigate(`/generating/${documentId}`)}>
            Continue to generation
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
