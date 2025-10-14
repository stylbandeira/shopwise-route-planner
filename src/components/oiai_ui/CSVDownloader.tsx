// components/ExportButton.tsx
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/utils/fileUtils";
import { Download } from "lucide-react";

interface ExportButtonProps {
    data: any[];
    filename?: string;
    disabled?: boolean;
    className?: string;
}

export function ExportButton({
    data,
    filename = "export",
    disabled = false,
    className
}: ExportButtonProps) {
    const handleExport = () => {
        if (data.length === 0) {
            alert("Nenhum dado para exportar");
            return;
        }

        exportToCSV(data, filename);
    };

    return (
        <Button
            onClick={handleExport}
            disabled={disabled || data.length === 0}
            variant="outline"
            className={className}
        >
            <Download className="h-4 w-4 mr-2" />
            Exportar
        </Button>
    );
}