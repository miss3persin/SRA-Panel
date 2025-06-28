
"use client";

import { useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { parseCSV } from '@/lib/csvParser';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ProcessedStudentResult, StudentResult } from '@/types';

interface FileUploadProps {
  onUploadComplete: (data: ProcessedStudentResult[]) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { setRawStudentData } = useData();
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
      }
    }
  };

  // GPA calculation logic (simple example)
  const calculateGPA = (score: number): number => {
    if (score >= 90) return 4.0;
    if (score >= 80) return 3.5;
    if (score >= 70) return 3.0;
    if (score >= 60) return 2.5;
    if (score >= 50) return 2.0;
    if (score >= 40) return 1.5;
    return 1.0;
  };

  const processAndSetData = (studentResults: StudentResult[]): ProcessedStudentResult[] => {
    return studentResults.map((result, index) => ({
      ...result,
      // Ensure unique ID by appending the index from the mapping operation
      id: `${result['Matric No'] || `no-matric-${index}`}-${result.Course}-${result.Semester}-${index}`, 
      Score: Number(result.Score), // Ensure score is a number
      gpa: calculateGPA(Number(result.Score)),
      pass: Number(result.Score) >= 40,
    }));
  };


  const handleParseFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to parse.",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);
    try {
      const { data, errors } = await parseCSV(selectedFile);
      if (errors.length > 0) {
        errors.forEach(error => console.error("CSV Parsing Error:", error));
        toast({
          title: "Parsing Issues",
          description: `Encountered ${errors.length} issue(s) while parsing. Check console for details. Some data might be missing or incorrect.`,
          variant: "destructive",
        });
      }
      
      if (data.length === 0 && errors.length > 0) {
         toast({
          title: "Parsing Failed",
          description: "Could not parse any data from the file. Please check the file format.",
          variant: "destructive",
        });
        setIsParsing(false);
        return;
      }
      
      setRawStudentData(data); // Store raw data for AI insights
      const processed = processAndSetData(data);
      onUploadComplete(processed); // Pass processed data to parent

      toast({
        title: "File Parsed Successfully",
        description: `${data.length} records loaded.`,
        action: <CheckCircle className="text-green-500" />,
      });

    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast({
        title: "Error Parsing File",
        description: "An unexpected error occurred. Please check the console.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg shadow">
      <h2 className="text-xl font-semibold text-card-foreground">Upload Student Results CSV</h2>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input
          type="file"
          accept=".csv"
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

