
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src="https://github.com/realjide.png" alt="@realjide" />
              <AvatarFallback>BJ</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl">About the Mapoly Student Result Analyzer</CardTitle>
          <CardDescription className="text-lg">A Project by Ogunleye Babajide Peter </CardDescription>
        </CardHeader>
        <CardContent className="text-base md:text-lg text-foreground/90 space-y-6 leading-relaxed px-6 md:px-10 pb-10">
          <p>
            This Student Result Analyzer was conceived and developed by Ogunleye Babajide Peter, a dedicated student of Moshood Abiola Polytechnic. Created as a significant academic project, this tool is a testament to the practical application of modern web technologies to solve real-world challenges within an educational environment. Babajide's vision was to build a platform that could transform raw student data into actionable insights, providing lecturers and academic advisors with a clear and instantaneous understanding of student performance, cohort trends, and potential areas for academic intervention.
          </p>
          <p>
            It is suggested that this application could be of practical use to Moshood Abiola Polytechnic, offering staff a streamlined way to interpret student performance data. The system demonstrates how technology can be applied to simplify academic processes, with potential for further development should the institution choose to pursue it. While this project stands as a functional proof-of-concept, its long-term adoption and enhancement will depend on how much value the academic community decides to derive from it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
