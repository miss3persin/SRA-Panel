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
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const valA = a[sortKey];
      const valB = b[sortKey];

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
    { key: 'Name', label: 'Name' },
    { key: 'Matric No', label: 'Matric No' },
    { key: 'Course', label: 'Course' },
    { key: 'Score', label: 'Score' },
    { key: 'Semester', label: 'Semester' },
    { key: 'Level', label: 'Level' },
    { key: 'gpa', label: 'GPA (Est.)' },
    { key: 'pass', label: 'Status' },
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
          <TableCaption>A list of student results.</TableCaption>
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
                <TableCell>{item.Name}</TableCell>
                <TableCell>{item['Matric No']}</TableCell>
                <TableCell>{item.Course}</TableCell>
                <TableCell>{item.Score}</TableCell>
                <TableCell>{item.Semester}</TableCell>
                <TableCell>{item.Level}</TableCell>
                <TableCell>{item.gpa?.toFixed(2) ?? 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={item.pass ? 'default' : 'destructive'} className={item.pass ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {item.pass ? 'Pass' : 'Fail'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" /> {/* Explicitly add vertical scrollbar if needed by design, ScrollArea usually handles this */}
      </ScrollArea>
      {filteredAndSortedData.length === 0 && searchTerm && (
        <p className="text-center text-muted-foreground py-4">No results found for "{searchTerm}".</p>
      )}
    </div>
  );
}
