
export interface StudentResult {
  id: string; // Unique ID for React keys
  'Matric No': string;
  'Student Name': string;
  Level?: string;
  Semester?: string;
  'Course Code': string;
  'Course Title'?: string;
  'Credit Units': number;
  Grade: string;
  GP: number;
  'Quality Points': number;
  GPA: number;
  CGPA: number;
  [key: string]: any; // For any unexpected columns from CSV
}

// This interface is largely the same as StudentResult now. We can unify later if needed.
export type ProcessedStudentResult = StudentResult;


// --- AI Insight Types ---

export interface TopPerformingStudent {
  name:string;
  matricNo: string;
  cgpa: number;
  reason: string;
}

export interface HighFailureCourse {
  course: string;
  failureRate: number;
  reason:string;
}

export interface GradeDistribution {
    grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    count: number;
    percentage: number;
}

export interface CourseGradeDistribution {
  course: string;
  distribution: GradeDistribution[];
  observation: string;
}

export interface AcademicStandingDistribution {
  standing: string;
  count: number;
  percentage: number;
  cgpaRange: string;
}

export interface KeyPerformanceIndicator {
  metric: string;
  value: string;
  observation: string;
}

export interface CourseDifficultyRanking {
    course: string;
    averageGp: number;
    studentCount: number;
}

export interface MostAndLeastConsistentStudents {
    type: 'Most Consistent' | 'Least Consistent';
    studentName: string;
    matricNo: string;
    cgpa: number;
    gpaStandardDeviation: number;
}

export interface FoundationalCourseImpact {
    course: string;
    averageGpForHighPerformers: number;
    observation: string;
}

export interface GradePointCorrelation {
  finding: string;
}

export interface AiInsights {
  topPerformingStudents: TopPerformingStudent[];
  highFailureCourses: HighFailureCourse[];
  courseGradeDistributions: CourseGradeDistribution[];
  academicStandingDistribution: AcademicStandingDistribution[];
  keyPerformanceIndicators: KeyPerformanceIndicator[];
  courseDifficultyRanking: CourseDifficultyRanking[];
  mostAndLeastConsistentStudents: MostAndLeastConsistentStudents[];
  foundationalCourseImpact: FoundationalCourseImpact[];
  gradePointCorrelation: GradePointCorrelation[];
}


// --- Chart and Stat Types ---

export interface CourseAverageGpa {
  course: string;
  averageGpa: number;
}

export interface PassFailDistribution {
  status: 'Pass' | 'Fail';
  count: number;
}

export interface CourseStats {
    course: string;
    studentCount: number;
    passCount: number;
    failCount: number;
    passRate: number; // percentage
    meanGpa: number;
    medianGpa: number;
    modeGpa: string;
    stdDevGpa: number;
}
