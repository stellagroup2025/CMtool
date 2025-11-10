"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportAnalyticsToCsvAction } from "../actions";
import { toast } from "sonner";

interface ExportButtonProps {
  brandId: string;
  startDate: Date;
  endDate: Date;
}

export function ExportButton({ brandId, startDate, endDate }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const result = await exportAnalyticsToCsvAction(brandId, startDate, endDate);
      
      if (result.success && result.csv) {
        // Create blob and download
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", result.filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Analytics exportados correctamente");
      } else {
        toast.error("Error al exportar datos");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Error al exportar datos");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      {exporting ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}
