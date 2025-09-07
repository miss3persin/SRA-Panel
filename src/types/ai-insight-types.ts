
import {z} from 'genkit';

// Input from the frontend for a single student course entry
export const StudentResultForAI = z.object({
  'Matric No': z.string(),
  'Student Name': z.string(),
  'Course Code': z.string(),
  'Course Title': z.string().optional(),
  'Credit Units': z.number(),
  'Level': z.string().optional(),
  'Semester': z.string().optional(),
  Grade: z.string(),
  GP: z.number().describe("The Grade Point for the course, e.g., 4.0 for a B on a 4.0 scale."),
  GPA: z.number().describe("The Grade Point Average for the semester."),
  CGPA: z.number().describe("The cumulative Grade Point Average up to that point."),
});

export const GenerateInsightsInputSchema = z.object({
  studentResults: z.array(StudentResultForAI).describe('An array of student result objects, including official GPA and CGPA.'),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

export const GenerateInsightsOutputSchema = z.object({
  topPerformingStudents: z
    .array(
      z.object({
        name: z.string(),
        matricNo: z.string(),
        cgpa: z.number().describe("The student's official CGPA from the provided data."),
        reason: z.string(),
      })
    )
    .describe('An array of the top 3 performing students by their latest CGPA.'),

  highFailureCourses: z
    .array(
      z.object({
        course: z.string(),
        failureRate: z
          .number()
          .describe(
            'The failure rate as a decimal (e.g., 0.45 for 45%). A student fails a course if their GP for it is 0.0.'
          ),
        reason: z.string(),
      })
    )
    .describe('An array of courses where >40% of students failed (i.e., had a GP of 0.0 for the course).'),

  courseGradeDistributions: z
    .array(
      z.object({
        course: z.string(),
        distribution: z.array(
          z.object({
            grade: z.string(),
            count: z.number(),
            percentage: z.number().describe('Percentage of students who got this grade in the course.'),
          })
        ),
        observation: z
          .string()
          .describe(
            "e.g., 'High number of F grades suggests a difficult course.' or 'Bimodal distribution with many A and F grades suggests a gap in student understanding.'"
          ),
      })
    )
    .describe('For each course, show the distribution of grades (A-F).'),

  academicStandingDistribution: z
    .array(
      z.object({
        standing: z.string().describe('The academic standing category (e.g., First Class, On Probation).'),
        count: z.number().describe('Number of unique students in this category.'),
        percentage: z.number().describe('Percentage of the total unique students in this category.'),
        cgpaRange: z.string().describe('The CGPA range for this standing, e.g., "3.50 - 4.00".'),
      })
    )
    .describe(
      'A distribution of unique students across different academic standing levels based on their final CGPA.'
    ),

  keyPerformanceIndicators: z
    .array(
      z.object({
        metric: z.string().describe('The name of the KPI, e.g., "Overall Average CGPA".'),
        value: z.string().describe('The value of the KPI, formatted as a string, e.g., "2.85".'),
        observation: z.string().describe('A brief interpretation of the metric.'),
      })
    )
    .describe('A summary of key performance indicators for the entire dataset.'),

  courseDifficultyRanking: z
    .array(
      z.object({
        course: z.string(),
        averageGp: z.number().describe('The average grade point for the course.'),
        studentCount: z.number().describe('Number of students who took the course.'),
      })
    )
    .describe(
      'A ranked list of the top 5 most challenging courses based on the lowest average Grade Point (GP).'
    ),

  mostAndLeastConsistentStudents: z
    .array(
      z.object({
        type: z.enum(['Most Consistent', 'Least Consistent']),
        studentName: z.string(),
        matricNo: z.string(),
        cgpa: z.number().describe("The student's final CGPA."),
        gpaStandardDeviation: z
          .number()
          .describe(
            'The standard deviation of their semester GPAs (for students with >= 2 semesters). A higher value means less consistency.'
          ),
      })
    )
    .describe(
      'Highlights the single most and least consistent students based on the standard deviation of their semester GPAs.'
    ),

  foundationalCourseImpact: z
    .array(
      z.object({
        course: z.string().describe('The 100-level course with the highest impact.'),
        observation: z
          .string()
          .describe('An observation about why this course is critical for long-term success.'),
      })
    )
    .describe(
      'Identifies the 100-level course that has the strongest positive correlation with high final CGPAs.'
    ),

  gradePointCorrelation: z
    .array(
      z.object({
        finding: z.string().describe('A clear, concise, data-driven correlation found in the data.'),
      })
    )
    .describe('An interesting and actionable correlation discovered in the dataset.'),
});

export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;
