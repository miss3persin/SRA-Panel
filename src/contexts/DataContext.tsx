
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo } from 'react';
import type { ProcessedStudentResult, AiInsights, CourseStats } from '@/types';

interface DataContextType {
  studentData: ProcessedStudentResult[];
  setStudentData: (data: ProcessedStudentResult[]) => void;
  aiInsights: AiInsights | null;
  setAiInsights: (insights: AiInsights | null) => void;
  filters: {
    course: string | null;
  };
  setFilters: (filters: DataContextType['filters']) => void;
  availableCourses: string[];
  filteredData: ProcessedStudentResult[];
  courseStats: CourseStats[];
  clearData: () => void;
  isLoadingInsights: boolean;
  setIsLoadingInsights: (loading: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [studentData, setStudentDataState] = useState<ProcessedStudentResult[]>([]);
  const [aiInsights, setAiInsightsState] = useState<AiInsights | null>(null);
  const [filters, setFiltersState] = useState<DataContextType['filters']>({
    course: null,
  });
  const [isLoadingInsights, setIsLoadingInsightsState] = useState<boolean>(false);

  const setStudentData = (data: ProcessedStudentResult[]) => {
    setStudentDataState(data);
    setAiInsightsState(null); // Reset insights when new data is set
    setFiltersState({ course: null });
  };

  const setAiInsights = (insights: AiInsights | null) => {
    setAiInsightsState(insights);
  };

  const setFilters = (newFilters: DataContextType['filters']) => {
    setFiltersState(newFilters);
  };

  const setIsLoadingInsights = (loading: boolean) => {
    setIsLoadingInsightsState(loading);
  };

  const clearData = () => {
    setStudentDataState([]);
    setAiInsightsState(null);
    setFiltersState({ course: null });
    setIsLoadingInsightsState(false);
  };

  const availableCourses = useMemo(() => {
    const courses = new Set(studentData.map(item => item['Course Code']));
    return Array.from(courses).sort();
  }, [studentData]);

  const filteredData = useMemo(() => {
    return studentData.filter(item => {
      const courseMatch = !filters.course || item['Course Code'] === filters.course;
      return courseMatch;
    });
  }, [studentData, filters]);

  const courseStats = useMemo(() : CourseStats[] => {
    if (filteredData.length === 0) return [];

    const statsByCourse: {[course: string]: ProcessedStudentResult[]} = {};
    for (const entry of filteredData) {
        const courseCode = entry['Course Code'];
        if (!statsByCourse[courseCode]) {
            statsByCourse[courseCode] = [];
        }
        statsByCourse[courseCode].push(entry);
    }
    
    return Object.entries(statsByCourse).map(([course, entries]) => {
        const studentCount = new Set(entries.map(e => e['Matric No'])).size;
        const passCount = entries.filter(e => e.GP > 0).length;
        const failCount = entries.length - passCount;
        const passRate = entries.length > 0 ? (passCount / entries.length) * 100 : 0;
        
        const gradePoints = entries.map(e => e.GP);
        const meanGpa = gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length;

        const sortedGPs = [...gradePoints].sort((a, b) => a - b);
        const mid = Math.floor(sortedGPs.length / 2);
        const medianGpa = sortedGPs.length % 2 !== 0 ? sortedGPs[mid] : (sortedGPs[mid - 1] + sortedGPs[mid]) / 2;

        const freqMap: { [key: number]: number } = {};
        gradePoints.forEach(gp => { freqMap[gp] = (freqMap[gp] || 0) + 1; });
        let maxFreq = 0;
        let modes: number[] = [];
        for (const gp in freqMap) {
            if (freqMap[gp] > maxFreq) {
                modes = [Number(gp)];
                maxFreq = freqMap[gp];
            } else if (freqMap[gp] === maxFreq) {
                modes.push(Number(gp));
            }
        }
        const modeGpa = modes.map(g => g.toFixed(2)).join(', ');
        
        const stdDevGpa = Math.sqrt(gradePoints.reduce((sq, n) => sq + Math.pow(n - meanGpa, 2), 0) / (gradePoints.length -1) || 0);

        return {
            course: entries[0]['Course Title'] || course, // Use title if available
            studentCount,
            passCount,
            failCount,
            passRate,
            meanGpa,
            medianGpa,
            modeGpa,
            stdDevGpa
        };
    }).sort((a, b) => a.course.localeCompare(b.course));

  }, [filteredData]);


  return (
    <DataContext.Provider value={{
      studentData,
      setStudentData,
      aiInsights,
      setAiInsights,
      filters,
      setFilters,
      availableCourses,
      filteredData,
      courseStats,
      clearData,
      isLoadingInsights,
      setIsLoadingInsights,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
