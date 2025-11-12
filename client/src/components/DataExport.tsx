import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileJson, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataExportProps {
  data: any[];
  filename?: string;
  columns?: string[];
}

export default function DataExport({
  data,
  filename = "export",
  columns,
}: DataExportProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Get headers from first object or use provided columns
      const headers = columns || Object.keys(data[0]);

      // Create CSV content
      let csv = headers.join(",") + "\n";

      data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];

          // Handle special characters and quotes
          if (value === null || value === undefined) {
            return "";
          }

          const stringValue = String(value);

          // Escape quotes and wrap in quotes if contains comma or newline
          if (
            stringValue.includes(",") ||
            stringValue.includes("\n") ||
            stringValue.includes('"')
          ) {
            return '"' + stringValue.replace(/"/g, '""') + '"';
          }

          return stringValue;
        });

        csv += values.join(",") + "\n";
      });

      // Create blob and download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${data.length} records exported to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting to CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Filter columns if specified
      let exportData = data;
      if (columns) {
        exportData = data.map((row) => {
          const filteredRow: any = {};
          columns.forEach((col) => {
            filteredRow[col] = row[col];
          });
          return filteredRow;
        });
      }

      // Create JSON content
      const json = JSON.stringify(exportData, null, 2);

      // Create blob and download
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${data.length} records exported to JSON`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting to JSON",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is no data available to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Get headers
      const headers = columns || Object.keys(data[0]);

      // Create HTML table
      let html = '<table><thead><tr>';
      headers.forEach((header) => {
        html += `<th>${header}</th>`;
      });
      html += '</tr></thead><tbody>';

      data.forEach((row) => {
        html += '<tr>';
        headers.forEach((header) => {
          const value = row[header] ?? "";
          html += `<td>${value}</td>`;
        });
        html += '</tr>';
      });

      html += '</tbody></table>';

      // Create blob and download as .xls (Excel will handle it)
      const blob = new Blob([html], {
        type: "application/vnd.ms-excel",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.xls`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `${data.length} records exported to Excel`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting to Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <Table className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
