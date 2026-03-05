import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Save, Mail, MessageSquare, AlertCircle, CheckCircle2, Loader2, Copy } from "lucide-react";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CircularProgress } from "@/components/circular-progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useResume, useUpdateResume, useOptimizeResume } from "@/hooks/use-resumes";
import { useGenerateCoverLetter } from "@/hooks/use-cover-letters";
import { useGenerateInterviewPrep } from "@/hooks/use-interview-preps";

export default function ResumeDetail() {
  const [, params] = useRoute("/resume/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: resume, isLoading, error } = useResume(id);
  const updateResume = useUpdateResume();
  const optimizeResume = useOptimizeResume();
  const generateCL = useGenerateCoverLetter();
  const generateIP = useGenerateInterviewPrep();

  const [jobDescription, setJobDescription] = useState("");
  const [activeTab, setActiveTab] = useState("original");

  useEffect(() => {
    if (resume?.jobDescription) {
      setJobDescription(resume.jobDescription);
    }
    if (resume?.optimizedContent) {
      setActiveTab("optimized");
    }
  }, [resume]);

  const handleSaveJobDesc = async () => {
    try {
      await updateResume.mutateAsync({ id, jobDescription });
      toast({ title: "Job description saved" });
    } catch (e) {
      toast({ title: "Error saving", variant: "destructive" });
    }
  };

  const handleOptimize = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Please enter a job description first", variant: "destructive" });
      return;
    }
    
    // Save job description first if it changed
    if (jobDescription !== resume?.jobDescription) {
      await updateResume.mutateAsync({ id, jobDescription });
    }

    try {
      await optimizeResume.mutateAsync({ id, jobDescription });
      toast({ title: "Resume optimized successfully!" });
      setActiveTab("optimized");
    } catch (error) {
      toast({ 
        title: "Optimization failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  const handleGenerateCL = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Job description is required to generate a cover letter", variant: "destructive" });
      return;
    }
    try {
      const result = await generateCL.mutateAsync({
        resumeId: id,
        jobDescription: jobDescription,
      });
      toast({ title: "Cover letter generated!" });
      setLocation(`/cover-letter/${result.id}`);
    } catch (e) {
      toast({ title: "Generation failed", variant: "destructive" });
    }
  };

  const handleGenerateIP = async () => {
    if (!jobDescription.trim()) {
      toast({ title: "Job description is required to generate interview prep", variant: "destructive" });
      return;
    }
    try {
      const result = await generateIP.mutateAsync({
        resumeId: id,
        jobDescription: jobDescription,
      });
      toast({ title: "Interview prep generated!" });
      setLocation(`/interview-prep/${result.id}`);
    } catch (e) {
      toast({ title: "Generation failed", variant: "destructive" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading resume data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !resume) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Resume not found</h2>
          <Link href="/">
            <Button className="mt-4"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{resume.title}</h1>
            <p className="text-muted-foreground mt-1">Review and optimize your resume for specific roles.</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-background shadow-sm"
              onClick={handleGenerateCL}
              disabled={generateCL.isPending}
            >
              {generateCL.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2 text-primary" />}
              Cover Letter
            </Button>
            <Button 
              variant="outline" 
              className="bg-background shadow-sm"
              onClick={handleGenerateIP}
              disabled={generateIP.isPending}
            >
              {generateIP.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2 text-accent" />}
              Interview Prep
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Content */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="original">Original Resume</TabsTrigger>
              <TabsTrigger value="optimized" disabled={!resume.optimizedContent}>
                Optimized Version
                {resume.optimizedContent && <span className="ml-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />}
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 relative min-h-[600px]">
              <AnimatePresence mode="wait">
                <TabsContent value="original" key="original" asChild forceMount>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: activeTab === 'original' ? 1 : 0, y: activeTab === 'original' ? 0 : 10, pointerEvents: activeTab === 'original' ? 'auto' : 'none', position: activeTab === 'original' ? 'relative' : 'absolute', top: 0, left: 0, right: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border/50 shadow-sm overflow-hidden h-full">
                      <div className="flex justify-between items-center bg-muted/30 px-4 py-2 border-b border-border/40">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw Text</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(resume.originalContent)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-6">
                        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90 font-medium">
                          {resume.originalContent}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="optimized" key="optimized" asChild forceMount>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: activeTab === 'optimized' ? 1 : 0, y: activeTab === 'optimized' ? 0 : 10, pointerEvents: activeTab === 'optimized' ? 'auto' : 'none', position: activeTab === 'optimized' ? 'relative' : 'absolute', top: 0, left: 0, right: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-primary/20 shadow-lg shadow-primary/5 overflow-hidden h-full relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                      <div className="flex justify-between items-center bg-primary/5 px-4 py-2 border-b border-primary/10">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center"><Sparkles className="w-3 h-3 mr-1" /> AI Optimized</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => copyToClipboard(resume.optimizedContent || "")}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-6">
                        <div className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-foreground">
                          {resume.optimizedContent}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>

        {/* Right Column: Actions & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {resume.atsScore !== null && resume.atsScore !== undefined && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="border-border/50 shadow-md bg-gradient-to-b from-card to-muted/20">
                <CardHeader className="pb-2 text-center">
                  <CardTitle className="text-lg">ATS Compatibility</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pb-6">
                  <CircularProgress value={resume.atsScore} className="my-4" />
                  
                  {resume.atsFeedback && (
                    <Alert className={`mt-4 ${resume.atsScore >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'} dark:bg-transparent`}>
                      {resume.atsScore >= 80 ? <CheckCircle2 className="h-4 w-4" color="currentColor" /> : <AlertCircle className="h-4 w-4" color="currentColor" />}
                      <AlertTitle>Feedback</AlertTitle>
                      <AlertDescription className="text-sm mt-1">
                        {resume.atsFeedback}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="border-border/50 shadow-sm sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Target Job
              </CardTitle>
              <CardDescription>Paste the job description to optimize your resume for this specific role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea 
                  placeholder="Paste job description here..."
                  className="min-h-[250px] resize-none bg-background/50 focus:bg-background transition-colors pr-10"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                {jobDescription !== resume.jobDescription && jobDescription.trim().length > 0 && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={handleSaveJobDesc}
                    disabled={updateResume.isPending}
                    title="Save Job Description"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md shadow-primary/20 h-12 text-md font-bold"
                onClick={handleOptimize}
                disabled={optimizeResume.isPending || !jobDescription.trim()}
              >
                {optimizeResume.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Optimizing Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Optimize Resume
                  </>
                )}
              </Button>
              
              {optimizeResume.isPending && (
                <p className="text-xs text-center text-muted-foreground animate-pulse">
                  Analyzing keywords and rewriting bullets... This takes a few seconds.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
