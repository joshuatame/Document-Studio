import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ErrorState } from "@/components/document-studio/error-state";
import { LoadingSkeleton } from "@/components/document-studio/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createCheckout,
  getPaymentStatus,
  isUnauthorizedError,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutResponse } from "@/types/document-studio";

export default function PaymentPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCheckout() {
    setLoading(true);
    setError(null);
    try {
      const data = await createCheckout(documentId);
      setCheckout(data);

      if (data.paymentStatus === "paid" || data.paymentStatus === "not_required") {
        navigate(`/generating/${documentId}`, { replace: true });
      }
    } catch (err) {
      if (isUnauthorizedError(err)) {
        navigate("/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load payment");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCheckout();
  }, [documentId]);

  async function handleCheckout() {
    setCheckoutLoading(true);
    try {
      const data = await createCheckout(documentId);
      setCheckout(data);

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.paymentStatus === "paid" || data.paymentStatus === "not_required") {
        toast.success("Payment confirmed");
        navigate(`/generating/${documentId}`);
      } else {
        toast.info("Checkout initiated — complete payment when ready");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleCheckStatus() {
    setStatusLoading(true);
    try {
      const data = await getPaymentStatus(documentId);
      setCheckout(data);

      if (data.paymentStatus === "paid" || data.paymentStatus === "not_required") {
        toast.success("Payment confirmed");
        navigate(`/generating/${documentId}`);
      } else {
        toast.info(`Payment status: ${data.paymentStatus}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to check status");
    } finally {
      setStatusLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={1} className="h-8 w-64" />
        <Card>
          <LoadingSkeleton lines={4} />
        </Card>
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={loadCheckout} />;
  if (!checkout) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Payment</h1>
        <p className="mt-1 text-graphite/80">
          Complete payment to trigger document generation. Card details are
          handled securely by the backend.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment summary</CardTitle>
          <CardDescription>
            Status: {checkout.paymentStatus.replace("_", " ")}
          </CardDescription>
        </CardHeader>
        <p className="text-3xl font-bold text-navy">
          {formatCurrency(checkout.priceCents, checkout.currency)}
        </p>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleCheckout} loading={checkoutLoading}>
          Proceed to checkout
        </Button>
        <Button
          variant="outline"
          onClick={handleCheckStatus}
          loading={statusLoading}
        >
          Check payment status
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/review/${documentId}`)}>
          Back to review
        </Button>
      </div>
    </div>
  );
}
