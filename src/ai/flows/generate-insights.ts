
// src/ai/flows/generate-insights.ts
'use server';
/**
 * @fileOverview AI insights generator for student result data.
 *
 * - generateInsights - A function that generates insights based on student results.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInsightsInputSchema = z.object({
  studentResults: z.array(
    z.object({
      Name: z.string(),
      'Matric No': z.string(),
      Course: z.string(),
      Score: z.number(),
      Semester: z.string(),
      Level: z.string(),
    })
  ).describe('An array of student result objects.'),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  atRiskStudents: z.array(
    z.object({
      name: z.string(),
      matricNo: z.string(),
      averageScore: z.number().describe("The student's average score across all their courses."),
      reason: z.string(),
    })
  ).describe('An array of students at risk of failing (average score < 40).'),
  topPerformingStudents: z.array(
    z.object({
      name: z.string(),
      matricNo: z.string(),
      averageScore: z.number().describe("The student's average score across all their courses."),
      reason: z.string(),
    })
  ).describe('An array of top 3 performing students by average score.'),
  highFailureCourses: z.array(
    z.object({
      course: z.string(),
      failureRate: z.number().describe("The failure rate as a decimal (e.g., 0.45 for 45%). A student fails a course if score < 40."),
      reason: z.string(),
    })
  ).describe('An array of courses where >40% of students scored below 40.'),
  performanceStability: z.array(
    z.object({
      studentName: z.string(),
      matricNo: z.string(),
      minScore: z.number(),
      maxScore: z.number(),
      scoreRange: z.number().describe("Difference between max and min score."),
      coursesEvaluated: z.number().describe("Number of courses taken by the student considered for this stability insight."),
      note: z.string().describe("Observation about performance stability, e.g., 'Significant score variation indicating unstable performance'.")
    })
  ).describe("Students with erratic performance (wide swing in scores across courses). Only include students with 3 or more courses and a score range > 30."),
  peerPerformanceBands: z.array(
    z.object({
        studentName: z.string(),
        matricNo: z.string(),
        course: z.string(),
        score: z.number(),
        courseMedian: z.number(),
        band: z.enum(['Significantly Above Median', 'Above Median', 'At Median', 'Below Median', 'Significantly Below Median']),
        reason: z.string().describe("Brief explanation of the banding.")
    })
  ).describe("Students' performance in courses relative to the course median. For each course, calculate median. Then for each student in that course: 'Significantly Above Median' (>15 pts above), 'Above Median' (1-15 pts above), 'At Median' (+/-1 pt from median), 'Below Median' (1-15 pts below), 'Significantly Below Median' (>15 pts below). Focus on students appearing in 'Significantly' bands or consistently across bands. Provide up to 10 illustrative examples, prioritizing students in 'Significantly' bands."),
  cohortPerformanceVariations: z.array(
    z.object({
      course: z.string(),
      cohort1Description: z.string().describe("Description of the first cohort, e.g., 'Semester Alpha'."),
      cohort1Metric: z.string().describe("Performance metric for cohort 1, e.g., 'Average Score: 72%' or 'Pass Rate: 78%'."),
      cohort2Description: z.string().describe("Description of the second cohort, e.g., 'Semester Beta'."),
      cohort2Metric: z.string().describe("Performance metric for cohort 2, e.g., 'Average Score: 55%' or 'Pass Rate: 50%'."),
      variationReason: z.string().describe("AI's interpretation of the significant difference.")
    })
  ).describe("Comparison of average scores or pass rates for the same course across different student cohorts (e.g., different semesters). Report only if there's a significant difference (e.g., >15% in pass rate or >10 points in average score). Identify cohorts by semester primarily. This insight was previously called Teacher Effectiveness Indicator."),
  scoreClusters: z.array(
    z.object({
      course: z.string(),
      scoreRange: z.string().describe("Narrow score range, e.g., '39-42'."),
      studentCount: z.number(),
      percentageOfClass: z.number().optional().describe("Percentage of students in this course falling into this cluster."),
      observation: z.string().describe("e.g., 'Indicates a potential grading cutoff issue or soft fail zone.'")
    })
  ).describe("Identification of courses with clusters of students scoring in very similar narrow ranges (e.g., 3-5 point range, especially near pass/fail boundaries). Report if more than 10% of students in a course fall into such a cluster or at least 5 students."),
  academicResilience: z.array(
    z.object({
      studentName: z.string(),
      matricNo: z.string(),
      failingSemester: z.string().describe("Semester where they had at least one failure (score < 40)."),
      failedCourseCount: z.number().describe("Number of courses failed in the failing semester."),
      recoverySemester: z.string().describe("The immediate subsequent semester."),
      recoveryAverageScore: z.number().describe("Average score in the recovery semester."),
      note: z.string().describe("e.g., 'Demonstrated resilience by recovering well after a challenging semester.'")
    })
  ).describe("Students who failed one or more courses (score < 40) in one semester but performed well (all scores >= 50 and average score >= 60) in the immediately following semester. Ensure semesters are chronologically ordered if possible (e.g. 'Semester 1' then 'Semester 2', or sort by typical academic year progression if semester names are like 'Fall 2023', 'Spring 2024')."),
  courseImpactInsights: z.array(
    z.object({
      course: z.string().describe("The name of the course."),
      impactDescription: z.string().describe("A qualitative description of the course's impact (e.g., 'High Positive Impact', 'Significant Negative Impact', 'Strong Predictor of Overall Success')."),
      observation: z.string().describe("A detailed observation explaining why this course is considered impactful, focusing on its correlation with overall student GPA or average scores.")
    })
  ).describe("Identifies courses where student performance in that specific course strongly correlates with their overall academic standing (e.g., overall GPA or average score across all subjects they have taken).")
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  return generateInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {schema: GenerateInsightsInputSchema},
  output: {schema: GenerateInsightsOutputSchema},
  config: { temperature: 0 }, // Added for consistency
  prompt: `You are a student success advisor. Analyze the provided student results data.
The data contains individual course scores for multiple students. Assume a pass mark of 40.

Student Results:
{{#each studentResults}}
  - Name: {{Name}}, Matric No: {{lookup this "Matric No"}}, Course: {{Course}}, Score: {{Score}}, Semester: {{Semester}}, Level: {{Level}}
{{/each}}

Instructions:
Your primary goal is to provide insights based on the student data. Ensure your output strictly adheres to the JSON schema provided for 'GenerateInsightsOutputSchema'. All numeric values in your output (scores, rates) must be numbers, not strings.

Core Insights (Mandatory):
1.  **At-Risk Students**: For each unique student, calculate their average score across all courses listed. Identify students whose calculated average score is below 40. For each, provide their name, matric number, calculated average score, and reason "Average score of X is below 40".
2.  **Top-Performing Students**: Identify the top 3 unique students with the highest calculated average scores. Provide name, matric number, calculated average score, and reason "High average score of X". If fewer than 3 students, list all. If ties for 3rd, include all tied.
3.  **Courses with High Failure Rates**: A course has a high failure rate if more than 40% of students taking that course (as per input data) scored below 40. Provide course name, calculated failure rate (decimal), and reason "X% of students failed".

Expanded Insights (Mandatory - provide data if applicable, empty array if not):
4.  **Performance Stability**:
    *   For each student who has taken at least 3 courses, calculate the range between their highest and lowest score.
    *   Identify students where this score range is greater than 30 points.
    *   For these students, output their name, matric no, min score, max score, the calculated score range, number of courses evaluated, and a note like "Significant score variation (X points) across Y courses, indicating potentially unstable performance."
5.  **Peer-Based Performance Banding**:
    *   For each course, calculate the median score of all students who took that course.
    *   Then, for each student's score in that course, categorize their performance relative to the course median:
        *   'Significantly Above Median': Score is >15 points above median.
        *   'Above Median': Score is 1 to 15 points above median.
        *   'At Median': Score is within +/-1 point of the median.
        *   'Below Median': Score is 1 to 15 points below median.
        *   'Significantly Below Median': Score is >15 points below median.
    *   Provide up to 10 illustrative examples of student-course records, prioritizing those in 'Significantly Above Median' or 'Significantly Below Median' bands. For each example, include student name, matric no, course, score, the course median, their band, and a brief reason.
6.  **Cohort Performance Variation** (previously Teacher Effectiveness Indicator):
    *   Identify courses that appear to be taught to different student cohorts (e.g., the same course offered in different Semesters, or potentially different Levels if data allows).
    *   For such courses, compare the average score or pass rate (percentage of students scoring >= 40) between these cohorts.
    *   If there's a significant difference (e.g., average score difference > 10 points, or pass rate difference > 15%), report this.
    *   Output the course name, descriptions for two cohorts (e.g., 'Fall 2023 Semester', 'Spring 2024 Semester'), their respective performance metrics (e.g., 'Avg Score: 72', 'Pass Rate: 0.60'), and a brief interpretation of the variation.
7.  **Score Cluster Detection**:
    *   For each course, analyze the distribution of scores.
    *   Identify if there are significant "clusters" where multiple students' scores fall within a very narrow range (e.g., a 3-5 point range), especially near critical thresholds like the pass mark (40).
    *   Report a cluster if at least 5 students or more than 10% of the class fall into such a narrow range.
    *   Output the course, the specific score range (e.g., "38-41"), the number of students in that cluster, the (optional) percentage of the class in the cluster (as a decimal, e.g., 0.10 for 10%), and an observation (e.g., "Cluster around pass mark, may warrant review" or "Concentration of scores between X and Y.").
8.  **Academic Resilience**:
    *   To identify academic resilience, you need to consider semester progression. Assume semesters like "Semester 1", "Semester 2" or "Fall 2023", "Spring 2024" indicate sequence. Try to infer chronological order if not explicit.
    *   Identify students who meet these criteria:
        *   In a given semester (the 'failing semester'), they failed at least one course (score < 40).
        *   In the *immediately subsequent* semester (the 'recovery semester'), ALL their course scores were 50 or higher, AND their average score for that recovery semester was 60 or higher.
    *   For these resilient students, output their name, matric no, the failing semester, count of failed courses in failing semester, the recovery semester, their average score in the recovery semester, and a note like "Showed resilience by improving significantly after a challenging semester."
9.  **Course Impact Insight**:
    *   Analyze the student data to identify courses where individual student performance in *that specific course* seems to strongly correlate with their *overall average score* across all subjects they have taken.
    *   The goal is to find courses that act as strong predictors or influencers of a student's general academic standing.
    *   For each such course identified, provide:
        *   course: The name of the impactful course.
        *   impactDescription: A qualitative summary of its impact (e.g., "Strong Positive Predictor", "Significant Negative Predictor if Failed", "Key Gateway Course").
        *   observation: A brief explanation. For example: "Students who achieve a high score in [Course Name] tend to have a substantially higher overall average score. Conversely, students who score poorly in this course often exhibit a lower overall average score, suggesting this course is critical for overall success." Or, "Performance in this course has a noticeable impact on overall GPA; it's a pivotal course for many students."
    *   Focus on courses where this relationship is notably strong and evident from the provided data.

Ensure all numeric outputs like averages and failure rates are actual numbers, not strings with '%'. For percentages in schema descriptions (like failureRate), these are decimals (e.g., 0.45 for 45%).
Return empty arrays for any insight category where no qualifying data is found.
Strictly follow the output schema.
`,
});

const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async input => {
    if (!input.studentResults || input.studentResults.length === 0) {
      return {
        atRiskStudents: [],
        topPerformingStudents: [],
        highFailureCourses: [],
        performanceStability: [],
        peerPerformanceBands: [],
        cohortPerformanceVariations: [],
        scoreClusters: [],
        academicResilience: [],
        courseImpactInsights: [],
      };
    }
    const {output} = await prompt(input);
    return output!;
  }
);

