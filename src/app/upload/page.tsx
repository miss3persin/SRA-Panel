"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/core/FileUpload';
import DataTable from '@/components/core/DataTable';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import type { ProcessedStudentResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { setProcessedStudentData, processedStudentData, clearData } = useData();
  const [showTable, setShowTable] = useState(false);

  const handleUploadComplete = (data: ProcessedStudentResult[]) => {
    setProcessedStudentData(data);
    setShowTable(true);
  };

  const handleClearData = () => {
    clearData();
    setShowTable(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Student Data</CardTitle>
          <CardDescription>Upload a CSV file with student results. Required columns: Name, Matric No, Course, Score, Semester, Level.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onUploadComplete={handleUploadComplete} />
        </CardContent>
      </Card>

      {showTable && processedStudentData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2"> {/* Added flex-wrap and gap-2 */}
            <div>
              <CardTitle>Preview Uploaded Data</CardTitle>
              <CardDescription>{processedStudentData.length} records loaded.</CardDescription>
            </div>
            <div className="flex flex-wrap justify-end gap-2"> {/* Changed space-x-2 to flex-wrap and gap-2 */}
               <Button variant="outline" onClick={handleClearData}>Clear Data</Button>
               <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable data={processedStudentData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}