import { useState } from "react";
import { Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  downloadDocumentDocx,
  downloadDocumentPdf,
} from "@/lib/api";
import { downloadBlob } from "@/lib/utils";

interface DownloadActionsProps {
  documentId: string;
  title: string;
  pdfAvailable?: boolean;
  docxAvailable?: boolean;
}

export function DownloadActions({
  documentId,
  title,
  pdfAvailable = true,
  docxAvailable = true,
}: DownloadActionsProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  const safeFilename = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "document";

  async function handlePdfDownload() {
    setDownloadingPdf(true);
    try {
      const blob = await downloadDocumentPdf(documentId);
      await downloadBlob(blob, `${safeFilename}.pdf`);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDocxDownload() {
    setDownloadingDocx(true);
    try {
      const blob = await downloadDocumentDocx(documentId);
      await downloadBlob(blob, `${safeFilename}.docx`);
      toast.success("DOCX downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "DOCX download failed");
    } finally {
      setDownloadingDocx(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {pdfAvailable && (
        <Button
          onClick={handlePdfDownload}
          loading={downloadingPdf}
          disabled={downloadingDocx}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      )}
      {docxAvailable && (
        <Button
          variant="outline"
          onClick={handleDocxDownload}
          loading={downloadingDocx}
          disabled={downloadingPdf}
        >
          <FileDown className="h-4 w-4" />
          Download DOCX
        </Button>
      )}
    </div>
  );
}
