import { useRoute, Link } from "wouter";
import { ArrowLeft, MessageSquare, Lightbulb, UserCircle } from "lucide-react";
import { format } from "date-fns";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { useInterviewPrep } from "@/hooks/use-interview-preps";

interface QuestionData {
  question: string;
  tips: string;
}

export default function InterviewPrepDetail() {
  const [, params] = useRoute("/interview-prep/:id");
  const id = parseInt(params?.id || "0");

  const { data: prep, isLoading, error } = useInterviewPrep(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">Preparing your questions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !prep) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Interview Prep not found</h2>
          <Link href="/">
            <Button className="mt-4"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Ensure questions is typed correctly
  const questions = (prep.questions as unknown) as QuestionData[];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <MessageSquare className="w-8 h-8 text-accent" />
                </div>
                Interview Questions
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Tailored questions based on your resume and the specific job requirements. Practice answering these aloud.
              </p>
            </div>
            <div className="text-sm font-medium bg-muted px-4 py-2 rounded-full inline-flex w-max">
              {questions.length} Questions Generated
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <Card key={index} className="border-border/60 shadow-sm overflow-hidden group">
              <div className="bg-muted/30 px-6 py-4 border-b border-border/40 flex gap-4 items-start">
                <div className="bg-background w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm border border-border">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-foreground leading-snug mt-1">
                  "{q.question}"
                </h3>
              </div>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={`item-${index}`} className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/10 group-data-[state=open]:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Lightbulb className="w-4 h-4" />
                        How to answer this
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 text-foreground/90 leading-relaxed relative">
                        <UserCircle className="absolute top-4 right-4 w-24 h-24 text-primary/5 pointer-events-none" />
                        <div className="relative z-10 whitespace-pre-wrap">
                          {q.tips}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
