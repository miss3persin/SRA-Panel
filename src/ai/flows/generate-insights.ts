
'use server';
/**
 * @fileOverview AI insights generator for student result data, using official CGPA on a 4.0 scale.
 *
 * - generateInsights - A function that generates insights based on student results.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateInsightsInput,
  GenerateInsightsInputSchema,
  GenerateInsightsOutput,
  GenerateInsightsOutputSchema,
} from '@/types/ai-insight-types';


export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {schema: GenerateInsightsInputSchema},
  output: {schema:GenerateInsightsOutputSchema},
  config: { temperature: 0.1 },
  prompt: `You are an expert academic advisor for a Nigerian Polytechnic that uses a 4.00 CGPA scale.
You have been provided with a list of student course results. Each result includes the official, pre-calculated Grade Point (GP) for the course, the Grade Point Average (GPA) for that semester, and the Cumulative Grade Point Average (CGPA) up to that point. A GP of 0.00 is a fail (F grade).

Use the provided official GPA and CGPA values for your analysis. Do NOT attempt to recalculate them.

Student Results Data Snippet:
{{#each studentResults}}
  - Name: {{lookup this "Student Name"}}, Matric No: {{lookup this "Matric No"}}, Course: {{lookup this "Course Code"}}, Grade: {{Grade}}, GP: {{GP}}, GPA: {{GPA}}, CGPA: {{CGPA}}, Credit Units: {{lookup this "Credit Units"}}
{{/each}}

Instructions:
Your goal is to provide specific, data-driven insights based on the provided results. The primary metrics are the official GP, GPA, and CGPA. All decimal values should be rounded to 2 decimal places. For any category where analysis is not possible, return an empty array.

Mandatory Insights (Provide data for all categories):

1.  **Top-Performing Students**:
    *   Identify the top 3 students with the highest latest CGPA.
    *   Provide their name, matric number, latest CGPA, and a reason like "Excellent academic standing based on official CGPA."

2.  **Courses with High Failure Rates**:
    *   A student fails a course if their Grade Point (GP) for that course is 0.00.
    *   Identify courses where more than 40% of the students failed.
    *   Provide the course code, calculated failure rate (as a decimal), and a reason.

3.  **Course Grade Distributions**:
    *   For each course, calculate the distribution of grades (A, B, C, D, E, F).
    *   Provide the count and percentage for each grade.
    *   Add a brief observation about the distribution (e.g., "High number of F grades suggests a difficult course.").

4.  **Academic Standing Distribution**:
    *   First, identify all unique students using their "Matric No". For each unique student, find their single, latest CGPA.
    *   Categorize all unique students based on their latest CGPA into the following bands:
        *   First Class (3.50 - 4.00)
        *   Second Class Upper (3.00 - 3.49)
        *   Second Class Lower (2.00 - 2.99)
        *   Third Class (1.00 - 1.99)
        *   On Probation (0.00 - 0.99)
    *   For each category, provide:
        *   'count': The number of students as an INTEGER.
        *   'percentage': The percentage of students as a DECIMAL between 0 and 1 (e.g., 0.03 for 3%). This must be calculated against the total number of UNIQUE students.

5.  **Key Performance Indicators (KPIs)**:
    *   Calculate and return the following three KPIs for the entire dataset:
        *   Overall Average CGPA: The average of the latest CGPA for all unique students.
        *   Overall Average Semester GPA: The average of all semester GPAs across all entries.
        *   Overall Pass Rate: The percentage of all course entries that have a GP greater than 0.00.
    *   Provide a brief observation for each metric.

6.  **Course Difficulty Ranking**:
    *   Calculate the average Grade Point (GP) for each course across all students.
    *   Return a ranked list of the top 5 most difficult courses, starting with the one with the lowest average GP.
    *   Include the course name, its average GP, and the number of students who took it.

7.  **Most & Least Consistent Students**:
    *   For each student with at least 2 semesters of data, calculate the standard deviation of their semester GPAs. This must only be done for students with 2 or more distinct semester entries.
    *   Identify the one student with the highest standard deviation (Least Consistent) and the one student with the lowest standard deviation (Most Consistent).
    *   Return both students, their final CGPA, and their GPA standard deviation.

8.  **Foundational Course Impact**:
    *   Analyze all 100-level courses.
    *   Identify the single 100-level course where high performance (e.g., GP of 3.0 or higher) has the strongest correlation with students achieving a high final CGPA (e.g., over 3.0).
    *   Return the course name and an observation about its importance (e.g., "Success in MTH101 is a strong predictor of overall academic success.").

9.  **Grade Point Correlation**:
    *   Find a strong, interesting, and actionable correlation in the data.
    *   Example: "Students who get a GP of 0.0 in MTH101 have an 85% probability of having a final CGPA below 2.00." or "90% of students with a CGPA above 3.5 achieved a GP of 4.0 in GST101."
    *   Provide a clear, concise statement describing the correlation you found.

Ensure all outputs strictly follow the provided JSON schema. All numeric values must be numbers rounded to two decimal places.
`,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async (input) => {
    if (!input.studentResults || input.studentResults.length === 0) {
      return {
        topPerformingStudents: [],
        highFailureCourses: [],
        courseGradeDistributions: [],
        academicStandingDistribution: [],
        keyPerformanceIndicators: [],
        courseDifficultyRanking: [],
        mostAndLeastConsistentStudents: [],
        foundationalCourseImpact: [],
        gradePointCorrelation: [],
      };
    }
    const {output} = await prompt(input);
    
    // Fallback for older model versions that might miss renames
    if (output && (output as any).atRiskStudents && !(output as any).studentsOnProbation) {
      (output as any).studentsOnProbation = (output as any).atRiskStudents;
      delete (output as any).atRiskStudents;
    }
    if (output && (output as any).scoreClusters && !(output as any).courseGradeDistributions) {
        (output as any).courseGradeDistributions = (output as any).scoreClusters;
        delete (output as any).scoreClusters;
    }

    return output!;
  }
);
