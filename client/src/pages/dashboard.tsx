import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Plus, FileText, Mail, MessageSquare, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

import { useResumes, useCreateResume, useDeleteResume } from "@/hooks/use-resumes";
import { useCoverLetters, useDeleteCoverLetter } from "@/hooks/use-cover-letters";
import { useInterviewPreps, useDeleteInterviewPrep } from "@/hooks/use-interview-preps";

const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  originalContent: z.string().min(50, "Please paste your full resume (at least 50 characters)"),
  jobDescription: z.string().optional(),
});

type CreateResumeFormValues = z.infer<typeof createResumeSchema>;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: resumes, isLoading: isLoadingResumes } = useResumes();
  const { data: coverLetters, isLoading: isLoadingCLs } = useCoverLetters();
  const { data: interviewPreps, isLoading: isLoadingIPs } = useInterviewPreps();

  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();
  const deleteCoverLetter = useDeleteCoverLetter();
  const deleteInterviewPrep = useDeleteInterviewPrep();

  const form = useForm<CreateResumeFormValues>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: {
      title: "",
      originalContent: "",
      jobDescription: "",
    },
  });

  const onSubmit = async (data: CreateResumeFormValues) => {
    try {
      const result = await createResume.mutateAsync(data);
      toast({ title: "Resume created successfully!" });
      setIsCreateOpen(false);
      form.reset();
      setLocation(`/resume/${result.id}`);
    } catch (error) {
      toast({ 
        title: "Failed to create resume", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">HireGenie</h1>
          <p className="text-lg text-muted-foreground mt-2">Generate the perfect resume for any job description.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5 mr-2" />
              New Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass-panel border-0">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Resume</DialogTitle>
              <DialogDescription>
                Paste your current resume content here. You can optimize it for specific jobs later.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend Developer - Tech Corp" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="originalContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume Content (Text)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste your plain text resume here..." 
                          className="min-h-[200px] font-mono text-sm bg-background/50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Job Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the job description you want to target..." 
                          className="min-h-[100px] bg-background/50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createResume.isPending}>
                    {createResume.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Resume
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="resumes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="resumes" className="rounded-lg data-[state=active]:shadow-sm">Resumes</TabsTrigger>
          <TabsTrigger value="cover-letters" className="rounded-lg data-[state=active]:shadow-sm">Cover Letters</TabsTrigger>
          <TabsTrigger value="interviews" className="rounded-lg data-[state=active]:shadow-sm">Interview Prep</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes">
          {isLoadingResumes ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : resumes?.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-2xl border-2 border-dashed border-border bg-card/30">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground">No resumes yet</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">Upload your first resume to start optimizing it for specific job applications.</p>
              <Button onClick={() => setIsCreateOpen(true)} className="mt-6" variant="outline">Create Resume</Button>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes?.map((resume) => (
                <motion.div key={resume.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col premium-shadow-hover border-border/50 group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-xl line-clamp-2 leading-tight">{resume.title}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 -mt-1 -mr-1"
                          onClick={(e) => {
                            e.preventDefault();
                            if(confirm("Are you sure you want to delete this resume?")) deleteResume.mutate(resume.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription>{format(new Date(resume.createdAt), 'MMM d, yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resume.optimizedContent && <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Optimized</Badge>}
                        {resume.atsScore && <Badge variant="outline" className="border-primary text-primary">ATS: {resume.atsScore}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {resume.originalContent}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-border/40 bg-muted/10">
                      <Link href={`/resume/${resume.id}`} className="w-full">
                        <Button className="w-full justify-between" variant="ghost">
                          View & Edit <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="cover-letters">
          {isLoadingCLs ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : coverLetters?.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-2xl border-2 border-dashed border-border bg-card/30">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground">No cover letters</h3>
              <p className="text-muted-foreground mt-2">Generate cover letters from your optimized resumes.</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coverLetters?.map((cl) => (
                <motion.div key={cl.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col premium-shadow-hover border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg line-clamp-2">For Resume #{cl.resumeId}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 -mt-1 -mr-1"
                          onClick={(e) => {
                            e.preventDefault();
                            if(confirm("Delete cover letter?")) deleteCoverLetter.mutate(cl.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription>{format(new Date(cl.createdAt), 'MMM d, yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-3 rounded-md font-serif italic">
                        "{cl.content}"
                      </p>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-border/40">
                      <Link href={`/cover-letter/${cl.id}`} className="w-full">
                        <Button className="w-full" variant="outline">View Cover Letter</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="interviews">
          {isLoadingIPs ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : interviewPreps?.length === 0 ? (
            <div className="text-center py-20 px-4 rounded-2xl border-2 border-dashed border-border bg-card/30">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground">No interview prep</h3>
              <p className="text-muted-foreground mt-2">Generate tailored interview questions based on your resume and job description.</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviewPreps?.map((ip) => (
                <motion.div key={ip.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col premium-shadow-hover border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg line-clamp-2">Prep for Resume #{ip.resumeId}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 -mt-1 -mr-1"
                          onClick={(e) => {
                            e.preventDefault();
                            if(confirm("Delete interview prep?")) deleteInterviewPrep.mutate(ip.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription>{format(new Date(ip.createdAt), 'MMM d, yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="bg-primary/5 text-primary rounded-lg p-4 text-center font-medium">
                        {(ip.questions as any[]).length} Questions Prepared
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-border/40">
                      <Link href={`/interview-prep/${ip.id}`} className="w-full">
                        <Button className="w-full" variant="outline">Practice Now</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
