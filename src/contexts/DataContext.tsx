
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useMemo } from 'react';
import type { ProcessedStudentResult, AiInsights, StudentResult, OverallPerformanceMetrics } from '@/types';

interface DataContextType {
  rawStudentData: StudentResult[];
  setRawStudentData: (data: StudentResult[]) => void;
  processedStudentData: ProcessedStudentResult[];
  setProcessedStudentData: (data: ProcessedStudentResult[]) => void;
  aiInsights: AiInsights | null;
  setAiInsights: (insights: AiInsights | null) => void;
  filters: {
    semester: string | null;
    level: string | null;
    course: string | null;
  };
  setFilters: (filters: DataContextType['filters']) => void;
  availableSemesters: string[];
  availableLevels: string[];
  availableCourses: string[];
  filteredData: ProcessedStudentResult[];
  overallPerformance: OverallPerformanceMetrics;
  clearData: () => void;
  isLoadingInsights: boolean;
  setIsLoadingInsights: (loading: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Removed initialAiInsights constant, will set to null initially

export function DataProvider({ children }: { children: ReactNode }) {
  const [rawStudentData, setRawStudentDataState] = useState<StudentResult[]>([]);
  const [processedStudentData, setProcessedStudentDataState] = useState<ProcessedStudentResult[]>([]);
  const [aiInsights, setAiInsightsState] = useState<AiInsights | null>(null); // Initialize to null
  const [filters, setFiltersState] = useState<DataContextType['filters']>({
    semester: null,
    level: null,
    course: null,
  });
  const [isLoadingInsights, setIsLoadingInsightsState] = useState<boolean>(false);

  const setRawStudentData = (data: StudentResult[]) => {
    setRawStudentDataState(data);
    setAiInsightsState(null); // Reset insights to null when new raw data is set
    setFiltersState({ semester: null, level: null, course: null });
  };
  
  const setProcessedStudentData = (data: ProcessedStudentResult[]) => {
    setProcessedStudentDataState(data);
    const raw = data.map(({ id, gpa, pass, ...rest }) => ({
        Name: rest.Name,
        'Matric No': rest['Matric No'],
        Course: rest.Course,
        Score: rest.Score,
        Semester: rest.Semester,
        Level: rest.Level,
        ...rest
    }) as StudentResult);
    setRawStudentDataState(raw); 
    setAiInsightsState(null); // Also reset insights if processed data changes significantly
  };

  const setAiInsights = (insights: AiInsights | null) => {
    setAiInsightsState(insights); // Can be null or an AiInsights object
  };

  const setFilters = (newFilters: DataContextType['filters']) => {
    setFiltersState(newFilters);
  };

  const setIsLoadingInsights = (loading: boolean) => {
    setIsLoadingInsightsState(loading);
  };

  const clearData = () => {
    setRawStudentDataState([]);
    setProcessedStudentDataState([]);
    setAiInsightsState(null); // Reset to null
    setFiltersState({ semester: null, level: null, course: null });
    setIsLoadingInsightsState(false);
  };

  const availableSemesters = useMemo(() => {
    const semesters = new Set(processedStudentData.map(item => item.Semester));
    return Array.from(semesters).sort();
  }, [processedStudentData]);

  const availableLevels = useMemo(() => {
    const levels = new Set(processedStudentData.map(item => item.Level));
    return Array.from(levels).sort();
  }, [processedStudentData]);

  const availableCourses = useMemo(() => {
    const courses = new Set(processedStudentData.map(item => item.Course));
    return Array.from(courses).sort();
  }, [processedStudentData]);

  const filteredData = useMemo(() => {
    return processedStudentData.filter(item => {
      const semesterMatch = !filters.semester || item.Semester === filters.semester;
      const levelMatch = !filters.level || item.Level === filters.level;
      const courseMatch = !filters.course || item.Course === filters.course;
      return semesterMatch && levelMatch && courseMatch;
    });
  }, [processedStudentData, filters]);

  const overallPerformance = useMemo(() : OverallPerformanceMetrics => {
    if (processedStudentData.length === 0) {
      return { totalUniqueStudents: 0, overallAverageScore: 0, overallPassRate: 0 };
    }
    const uniqueStudents = new Set(processedStudentData.map(s => s['Matric No']));
    const totalScores = processedStudentData.reduce((sum, s) => sum + s.Score, 0);
    const passedEntries = processedStudentData.filter(s => s.pass).length;
    const averageScore = processedStudentData.length > 0 ? totalScores / processedStudentData.length : 0;
    const passRate = processedStudentData.length > 0 ? (passedEntries / processedStudentData.length) * 100 : 0;


    return {
      totalUniqueStudents: uniqueStudents.size,
      overallAverageScore: parseFloat(averageScore.toFixed(2)),
      overallPassRate: parseFloat(passRate.toFixed(2)),
    };
  }, [processedStudentData]);


  return (
    <DataContext.Provider value={{
      rawStudentData,
      setRawStudentData,
      processedStudentData,
      setProcessedStudentData,
      aiInsights,
      setAiInsights,
      filters,
      setFilters,
      availableSemesters,
      availableLevels,
      availableCourses,
      filteredData,
      overallPerformance,
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
