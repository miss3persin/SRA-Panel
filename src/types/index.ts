
export interface StudentResult {
  Name: string;
  'Matric No': string;
  Course: string;
  Score: number;
  Semester: string;
  Level: string;
  [key: string]: any; // For any unexpected columns from CSV, or for flexibility
}

export interface ProcessedStudentResult extends StudentResult {
  id: string; // Unique ID for React keys, typically Matric No + Course + Semester
  gpa?: number; // Optional GPA, calculated client-side
  pass: boolean; // True if Score >= 40
}

export interface AtRiskStudent {
  name: string;
  matricNo: string;
  averageScore: number;
  reason: string;
}

export interface TopPerformingStudent {
  name: string;
  matricNo: string;
  averageScore: number;
  reason: string;
}

export interface HighFailureCourse {
  course: string;
  failureRate: number; // As a decimal, e.g., 0.45 for 45%
  reason:string;
}

export interface PerformanceStabilityInsight {
  studentName: string;
  matricNo: string;
  minScore: number;
  maxScore: number;
  scoreRange: number;
  coursesEvaluated: number;
  note: string;
}

export interface PeerPerformanceBandStudent {
  studentName: string;
  matricNo: string;
  course: string;
  score: number;
  courseMedian: number;
  band: 'Significantly Above Median' | 'Above Median' | 'At Median' | 'Below Median' | 'Significantly Below Median';
  reason: string;
}

export interface CourseCohortPerformanceVariation {
  course: string;
  cohort1Description: string; // e.g., "Semester X"
  cohort1Metric: string; // e.g., "Average Score: 75%" or "Pass Rate: 80%"
  cohort2Description: string; // e.g., "Semester Y"
  cohort2Metric: string; // e.g., "Average Score: 50%" or "Pass Rate: 45%"
  variationReason: string; // AI's interpretation of the difference
}

export interface ScoreCluster {
  course: string;
  scoreRange: string; // e.g., "39-42"
  studentCount: number;
  percentageOfClass?: number; // Percentage of students in this course falling into this cluster
  observation: string;
}

export interface AcademicResilienceStudent {
  studentName: string;
  matricNo: string;
  failingSemester: string; // Semester where they had a failure
  failedCourseCount: number;
  recoverySemester: string; // Subsequent semester with good performance
  recoveryAverageScore: number;
  note: string;
}

export interface CourseImpactInsight {
  course: string;
  impactDescription: string; // e.g., "High Positive Impact", "Significant Negative Impact"
  observation: string; // AI's reasoning or detailed observation
}

export interface AiInsights {
  atRiskStudents: AtRiskStudent[];
  highFailureCourses: HighFailureCourse[];
  topPerformingStudents: TopPerformingStudent[];
  performanceStability: PerformanceStabilityInsight[];
  peerPerformanceBands: PeerPerformanceBandStudent[];
  cohortPerformanceVariations: CourseCohortPerformanceVariation[];
  scoreClusters: ScoreCluster[];
  academicResilience: AcademicResilienceStudent[];
  courseImpactInsights: CourseImpactInsight[];
}

// For chart data
export interface CourseAverageScore {
  course: string;
  averageScore: number;
}

export interface PassFailDistribution {
  status: 'Pass' | 'Fail';
  count: number;
}

// For Overall Performance Metrics
export interface OverallPerformanceMetrics {
  totalUniqueStudents: number;
  overallAverageScore: number;
  overallPassRate: number; // Percentage
}
