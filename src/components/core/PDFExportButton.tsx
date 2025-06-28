
// PDFExportButton.tsx
"use client";

import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PDFExportButtonProps {
  elementIdToPrint: string;
  fileName?: string;
  buttonText?: string;
}

export default function PDFExportButton({
  elementIdToPrint,
  fileName = "SRA_Panel_Report",
  buttonText = "Export as PDF"
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    const elementToPrint = document.getElementById(elementIdToPrint);
    if (!elementToPrint) {
      toast({
        title: "Export Error",
        description: "Could not find the content to export. Element ID not found.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Exporting PDF",
      description: "Please wait while your report is being generated...",
    });

    const isDark = document.documentElement.classList.contains('dark');
    
    const darkThemeBackgroundColor = "hsl(0 0% 2%)"; 
    const darkThemeForegroundColor = "hsl(0 0% 95%)"; 
    const lightThemeBackgroundColor = "hsl(0 0% 100%)"; 
    const lightThemeForegroundColor = "hsl(240 10% 3.9%)";

    const pdfBackgroundColor = isDark ? darkThemeBackgroundColor : lightThemeBackgroundColor;
    const pdfForegroundColor = isDark ? darkThemeForegroundColor : lightThemeForegroundColor;

    const originalElementBgStyle = elementToPrint.style.backgroundColor;
    const originalElementColorStyle = elementToPrint.style.color;

    const rechartsSvgTextSelectors = [
      '.recharts-cartesian-axis-tick-value tspan',
      'text.recharts-text', 
      '.recharts-label', 
      '.recharts-legend-item text', 
      '.recharts-tooltip-label', 
      '.recharts-tooltip-item-name', 
      '.recharts-tooltip-item-value', 
      'tspan', 
    ].join(', ');

    const svgTextElements = Array.from(elementToPrint.querySelectorAll(rechartsSvgTextSelectors)) as SVGTextElement[];
    const originalSvgTextFills: (string | null)[] = svgTextElements.map(el => el.style.fill);
    const originalSvgTextStrokes: (string | null)[] = svgTextElements.map(el => el.style.stroke);


    try {
      elementToPrint.style.backgroundColor = pdfBackgroundColor;
      elementToPrint.style.color = pdfForegroundColor;

      svgTextElements.forEach(el => {
        el.style.fill = pdfForegroundColor; 
        el.style.stroke = "none"; 
      });

      const canvas = await html2canvas(elementToPrint, {
        scale: 2, 
        useCORS: true,
        backgroundColor: pdfBackgroundColor, 
        width: elementToPrint.scrollWidth, 
        height: elementToPrint.scrollHeight, 
        windowWidth: document.documentElement.scrollWidth, 
        windowHeight: document.documentElement.scrollHeight, 
        onclone: (documentClone) => {
            const clonedElement = documentClone.getElementById(elementIdToPrint);
            if (clonedElement) {
                clonedElement.style.backgroundColor = pdfBackgroundColor;
                clonedElement.style.color = pdfForegroundColor;
                const clonedSvgTextElements = Array.from(clonedElement.querySelectorAll(rechartsSvgTextSelectors)) as SVGTextElement[];
                clonedSvgTextElements.forEach(el => {
                    el.style.fill = pdfForegroundColor;
                    el.style.stroke = "none";
                });

                // Force charts to stack vertically for PDF export
                const chartsGrid = clonedElement.querySelector('#charts-grid-container');
                if (chartsGrid) {
                    chartsGrid.classList.remove('lg:grid-cols-2');
                    chartsGrid.classList.add('grid-cols-1'); 
                }
            }
        }
      });

      const imgDataUrl = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidthMM = pdf.internal.pageSize.getWidth();
      const pageHeightMM = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = imgDataUrl;
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => {
          console.error("Failed to load image for PDF export", err);
          reject(new Error("Failed to load captured image for PDF."));
        };
      });
      
      const sourceImgWidthPx = img.width; 
      const sourceImgHeightPx = img.height;
      
      let yPositionOnSourcePx = 0;
      let pageCount = 0;

      while (yPositionOnSourcePx < sourceImgHeightPx) {
        pageCount++;
        if (pageCount > 1) {
          pdf.addPage('a4', 'portrait');
        }

        const maxSourceSegmentHeightPx = (pageHeightMM / pageWidthMM) * sourceImgWidthPx;
        const currentSourceSegmentHeightPx = Math.min(maxSourceSegmentHeightPx, sourceImgHeightPx - yPositionOnSourcePx);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sourceImgWidthPx;
        tempCanvas.height = currentSourceSegmentHeightPx;
        const ctx = tempCanvas.getContext('2d');

        if (!ctx) {
          throw new Error("Failed to get 2D context from temporary canvas for PDF generation.");
        }
        
        ctx.drawImage(
          img,
          0, yPositionOnSourcePx,
          sourceImgWidthPx, currentSourceSegmentHeightPx,
          0, 0,
          sourceImgWidthPx, currentSourceSegmentHeightPx
        );
        
        const segmentDataUrl = tempCanvas.toDataURL('image/png');
        const segmentHeightOnPdfMM = (currentSourceSegmentHeightPx / sourceImgWidthPx) * pageWidthMM;

        pdf.addImage(
          segmentDataUrl, 'PNG',
          0, 0,
          pageWidthMM, segmentHeightOnPdfMM
        );
        
        yPositionOnSourcePx += currentSourceSegmentHeightPx;
      }
      
      pdf.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Export Successful",
        description: "Your PDF report has been downloaded.",
        variant: "default",
      });

    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: `An error occurred while generating the PDF. ${error instanceof Error ? error.message : 'Check console for details.'}`,
        variant: "destructive",
      });
    } finally {
      elementToPrint.style.backgroundColor = originalElementBgStyle;
      elementToPrint.style.color = originalElementColorStyle;

      svgTextElements.forEach((el, index) => {
        const originalFill = originalSvgTextFills[index];
        const originalStroke = originalSvgTextStrokes[index];
        if (originalFill !== null) el.style.fill = originalFill; else el.style.removeProperty('fill');
        if (originalStroke !== null) el.style.stroke = originalStroke; else el.style.removeProperty('stroke');
      });
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4" />
      )}
      {isExporting ? 'Exporting...' : buttonText}
    </Button>
  );
}
