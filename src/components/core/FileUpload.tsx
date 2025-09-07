
"use client";

import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { parseStudentDataFile } from '@/lib/fileParser';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, CheckCircle } from 'lucide-react';
import type { ProcessedStudentResult } from '@/types';

interface FileUploadProps {
  onUploadComplete: (data: ProcessedStudentResult[]) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const fileType = file.type;
      const fileName = file.name;
      const allowedTypes = [
        'text/csv', 
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (allowedTypes.includes(fileType) || fileName.endsWith('.csv') || fileName.endsWith('.xlsx')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV or XLSX file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
      }
    }
  };

  const handleParseFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to parse.",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);
    try {
      const { data, errors } = await parseStudentDataFile(selectedFile);
      if (errors.length > 0) {
        errors.forEach(error => console.error("File Parsing Error:", error));
        toast({
          title: "Parsing Issues",
          description: `Encountered ${errors.length} issue(s) while parsing. Check console for details. Some data might be missing or incorrect.`,
          variant: "destructive",
        });
      }
      
      if (data.length === 0 && errors.length > 0) {
         toast({
          title: "Parsing Failed",
          description: "Could not parse any data from the file. Please check the file format and required columns.",
          variant: "destructive",
        });
        setIsParsing(false);
        return;
      }
      
      onUploadComplete(data);

      toast({
        title: "File Parsed Successfully",
        description: `${data.length} records loaded.`,
        action: <CheckCircle className="text-green-500" />,
      });

    } catch (error) {
      console.error("Error parsing file:", error);
      toast({
        title: "Error Parsing File",
        description: `An unexpected error occurred. ${error instanceof Error ? error.message : 'Please check the console.'}`,
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold text-card-foreground">Upload Student Results File</h2>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input
          type="file"
          accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          className="flex-grow h-11 px-3 py-0 align-middle file:mr-4 file:h-full file:cursor-pointer file:rounded-md file:border-0 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          disabled={isParsing}
        />
        <Button onClick={handleParseFile} disabled={!selectedFile || isParsing} className="w-full sm:w-auto">
          {isParsing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          {isParsing ? 'Parsing...' : 'Parse File'}
        </Button>
      </div>
      {selectedFile && (
        <p className="text-sm text-muted-foreground">Selected file: {selectedFile.name}</p>
      )}
    </div>
  );
}
