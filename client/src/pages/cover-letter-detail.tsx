import { useRoute, Link } from "wouter";
import { ArrowLeft, Copy, Mail, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { useCoverLetter } from "@/hooks/use-cover-letters";

export default function CoverLetterDetail() {
  const [, params] = useRoute("/cover-letter/:id");
  const id = parseInt(params?.id || "0");
  const { toast } = useToast();

  const { data: cl, isLoading, error } = useCoverLetter(id);

  const copyToClipboard = () => {
    if (cl?.content) {
      navigator.clipboard.writeText(cl.content);
      toast({ title: "Cover letter copied to clipboard" });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <Mail className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">Loading cover letter...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !cl) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Cover Letter not found</h2>
          <Link href="/">
            <Button className="mt-4"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              Generated Cover Letter
            </h1>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(cl.createdAt), 'MMMM d, yyyy')}</span>
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> For Resume #{cl.resumeId}</span>
            </div>
          </div>
          
          <Button onClick={copyToClipboard} size="lg" className="shrink-0 shadow-sm">
            <Copy className="w-4 h-4 mr-2" /> Copy Full Text
          </Button>
        </div>

        <Card className="border-border/50 shadow-xl bg-card premium-shadow relative overflow-hidden">
          <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700" />
          <CardContent className="p-8 md:p-12">
            <div 
              className="prose prose-slate dark:prose-invert max-w-none font-serif text-[16px] leading-relaxed text-foreground/90 whitespace-pre-wrap"
            >
              {cl.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
