
"use client";

import type { ProcessedStudentResult } from '@/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataTableProps {
  data: ProcessedStudentResult[];
}

type SortKey = keyof ProcessedStudentResult | null;

export default function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('CGPA');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: keyof ProcessedStudentResult) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const Sorter = ({ columnKey, label }: { columnKey: keyof ProcessedStudentResult, label: string }) => (
    <Button variant="ghost" onClick={() => handleSort(columnKey)} className="px-2 py-1 h-auto">
      {label}
      <ArrowUpDown className={`ml-2 h-3 w-3 ${sortKey === columnKey ? '' : 'opacity-30'}`} />
    </Button>
  );


  const filteredAndSortedData = data
    .filter(item => {
      if (!searchTerm) return true;
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      // Also search by course title if it exists
      const courseTitle = item['Course Title'] || '';
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(lowercasedSearchTerm)
      ) || courseTitle.toLowerCase().includes(lowercasedSearchTerm);
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === undefined || valB === undefined) return 0;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return 0;
    });

  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No data uploaded or matches current filters.</p>;
  }
  
  const headers: { key: keyof ProcessedStudentResult, label: string }[] = [
    { key: 'Student Name', label: 'Student Name' },
    { key: 'Matric No', label: 'Matric No' },
    { key: 'Level', label: 'Level' },
    { key: 'Semester', label: 'Semester' },
    { key: 'Course Code', label: 'Course Code' },
    { key: 'Course Title', label: 'Course Title' },
    { key: 'Credit Units', label: 'Units' },
    { key: 'Grade', label: 'Grade' },
    { key: 'GP', label: 'GP' },
    { key: 'Quality Points', label: 'QP' },
    { key: 'GPA', label: 'GPA' },
    { key: 'CGPA', label: 'CGPA' },
  ];


  return (
    <div className="space-y-4">
      <Input
        placeholder="Search table..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <ScrollArea className="rounded-md border shadow-md overflow-auto" style={{maxHeight: '600px'}}>
        <Table>
          <TableCaption>A list of student results. Click on a column header to sort.</TableCaption>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              {headers.map(header => (
                <TableHead key={String(header.key)}>
                  <Sorter columnKey={header.key} label={header.label} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item['Student Name']}</TableCell>
                <TableCell>{item['Matric No']}</TableCell>
                <TableCell>{item.Level || 'N/A'}</TableCell>
                <TableCell>{item.Semester || 'N/A'}</TableCell>
                <TableCell>{item['Course Code']}</TableCell>
                <TableCell>{item['Course Title']}</TableCell>
                <TableCell>{item['Credit Units']}</TableCell>
                <TableCell>
                   <Badge variant={item.GP > 0 ? 'default' : 'destructive'} className={item.GP > 0 ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {item.Grade}
                  </Badge>
                </TableCell>
                <TableCell>{item.GP.toFixed(2)}</TableCell>
                <TableCell>{item['Quality Points'].toFixed(2)}</TableCell>
                <TableCell>{item.GPA.toFixed(2)}</TableCell>
                <TableCell className="font-semibold">{item.CGPA.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      {filteredAndSortedData.length === 0 && searchTerm && (
        <p className="text-center text-muted-foreground py-4">No results found for "{searchTerm}".</p>
      )}
    </div>
  );
}
