import Papa from 'papaparse';
import type { StudentResult } from '@/types';

export interface ParseResult {
  data: StudentResult[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<StudentResult>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically converts numbers and booleans
      complete: (results) => {
        // Ensure Score is a number, handle potential nulls or non-numeric values from dynamicTyping if headers are inconsistent
        const processedData = results.data.map(row => ({
          ...row,
          Score: typeof row.Score === 'number' ? row.Score : parseFloat(String(row.Score)) || 0,
        })).filter(row => row.Name && row['Matric No'] && row.Course); // Basic validation for required fields
        
        resolve({ data: processedData, errors: results.errors, meta: results.meta });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
