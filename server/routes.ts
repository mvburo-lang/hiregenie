import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // -- Resumes --
  
  app.get(api.resumes.list.path, async (_req, res) => {
  return res.json([]);
});

  app.get(api.resumes.get.path, async (req, res) => {
    const resume = await storage.getResume(Number(req.params.id));
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  });

  app.post(api.resumes.create.path, async (req, res) => {
    try {
      const input = api.resumes.create.input.parse(req.body);
      const newResume = await storage.createResume(input);
      res.status(201).json(newResume);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.resumes.update.path, async (req, res) => {
    try {
      const input = api.resumes.update.input.parse(req.body);
      const resume = await storage.getResume(Number(req.params.id));
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      const updated = await storage.updateResume(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.resumes.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const resume = await storage.getResume(id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    await storage.deleteResume(id);
    res.status(204).send();
  });

  // AI Generation endpoints
  
  app.post(api.resumes.optimize.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { jobDescription } = api.resumes.optimize.input.parse(req.body);
      
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Update the resume with the new job description if provided
      await storage.updateResume(id, { jobDescription });

      const prompt = `You are an expert resume writer and ATS (Applicant Tracking System) optimizer. 
I have a resume and a target job description. 
Please rewrite the resume to better match the job description, optimizing bullet points to be stronger, quantifying achievements where possible, and including relevant keywords.
Also provide an estimated ATS score (0-100) based on how well the original resume matched the job, and a brief feedback statement.

Output JSON strictly in the following format:
{
  "optimizedContent": "The full rewritten resume text",
  "atsScore": 85,
  "atsFeedback": "Brief feedback on why it scored this and what was improved."
}

Resume:
${resume.originalContent}

Job Description:
${jobDescription}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.optimizedContent || typeof result.atsScore !== 'number') {
        throw new Error("Failed to parse AI response correctly");
      }

      const updated = await storage.updateResumeOptimization(id, {
        optimizedContent: result.optimizedContent,
        atsScore: result.atsScore,
        atsFeedback: result.atsFeedback || "",
      });

      res.json(updated);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to optimize resume" });
    }
  });

  // -- Cover Letters --

  app.get(api.coverLetters.list.path, async (req, res) => {
    const list = await storage.getCoverLetters();
    res.json(list);
  });

  app.get(api.coverLetters.get.path, async (req, res) => {
    const cl = await storage.getCoverLetter(Number(req.params.id));
    if (!cl) return res.status(404).json({ message: "Cover letter not found" });
    res.json(cl);
  });

  app.post(api.coverLetters.generate.path, async (req, res) => {
    try {
      const input = api.coverLetters.generate.input.parse(req.body);
      
      let resumeContext = "";
      if (input.resumeId) {
        const resume = await storage.getResume(input.resumeId);
        if (resume) {
          resumeContext = resume.optimizedContent || resume.originalContent;
        }
      }

      const prompt = `You are an expert career coach. Write a compelling, professional cover letter for the following job description.
Use the provided resume for context about the applicant's experience and skills.

Resume Context:
${resumeContext || "No resume provided. Write a generic template with placeholders."}

Job Description:
${input.jobDescription}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0].message.content || "";
      
      const newCl = await storage.createCoverLetter({
        resumeId: input.resumeId,
        jobDescription: input.jobDescription,
        content: content
      });

      res.status(201).json(newCl);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  app.delete(api.coverLetters.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const cl = await storage.getCoverLetter(id);
    if (!cl) return res.status(404).json({ message: "Cover letter not found" });
    await storage.deleteCoverLetter(id);
    res.status(204).send();
  });

  // -- Interview Preps --

  app.get(api.interviewPreps.list.path, async (req, res) => {
    const list = await storage.getInterviewPreps();
    res.json(list);
  });

  app.get(api.interviewPreps.get.path, async (req, res) => {
    const prep = await storage.getInterviewPrep(Number(req.params.id));
    if (!prep) return res.status(404).json({ message: "Interview prep not found" });
    res.json(prep);
  });

  app.post(api.interviewPreps.generate.path, async (req, res) => {
    try {
      const input = api.interviewPreps.generate.input.parse(req.body);
      
      let resumeContext = "";
      if (input.resumeId) {
        const resume = await storage.getResume(input.resumeId);
        if (resume) {
          resumeContext = resume.optimizedContent || resume.originalContent;
        }
      }

      const prompt = `You are an expert technical recruiter and hiring manager.
Based on the following job description and the candidate's resume, generate 5-7 customized interview questions they are likely to be asked.
For each question, provide tips on how to best answer it given their specific experience from the resume.

Output JSON strictly in the following format:
{
  "questions": [
    {
      "question": "The interview question",
      "tips": "Tips on how to answer it effectively using the STAR method where appropriate."
    }
  ]
}

Resume Context:
${resumeContext || "No resume provided. Generate general questions."}

Job Description:
${input.jobDescription}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error("Failed to parse AI response correctly");
      }
      
      const newPrep = await storage.createInterviewPrep({
        resumeId: input.resumeId,
        jobDescription: input.jobDescription,
        questions: result.questions,
      });

      res.status(201).json(newPrep);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to generate interview prep" });
    }
  });

  app.delete(api.interviewPreps.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const prep = await storage.getInterviewPrep(id);
    if (!prep) return res.status(404).json({ message: "Interview prep not found" });
    await storage.deleteInterviewPrep(id);
    res.status(204).send();
  });

  // Database Seed Function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  try {
    const existing = await storage.getResumes();
    if (existing.length === 0) {
      const demoResume = await storage.createResume({
        title: "Software Engineer Resume",
        originalContent: "Software Engineer with 3 years of experience in React and Node.js. Built scalable web applications. Managed a team of 2 developers. Improved database performance by 20%.",
        jobDescription: "Senior Frontend Engineer wanted. Must have strong React skills, experience with Next.js, and a track record of optimizing performance. Leadership experience is a plus.",
      });

      await storage.updateResumeOptimization(demoResume.id, {
        optimizedContent: "Senior Software Engineer with 3+ years driving frontend excellence using React and Node.js. Architected scalable web applications, directly mentoring a team of 2 developers to deliver features 15% faster. Spearheaded a database optimization initiative that decreased query latency by 20%, significantly improving application performance. Ready to leverage leadership and React expertise to elevate user experiences.",
        atsScore: 82,
        atsFeedback: "The resume is strong, but was missing specific mentions of Next.js which was in the job description. Rewrote bullet points to be more action-oriented and quantified achievements.",
      });

      await storage.createCoverLetter({
        resumeId: demoResume.id,
        jobDescription: demoResume.jobDescription!,
        content: "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Frontend Engineer position. With over 3 years of experience building scalable applications with React and Node.js, and a proven track record of leading development teams, I am confident in my ability to contribute effectively to your engineering goals.\n\nIn my previous role, I successfully optimized database performance by 20% and mentored a small team to deliver high-quality features. I am particularly drawn to this role because of the opportunity to leverage Next.js and further my impact on frontend architecture.\n\nThank you for your time and consideration.\n\nBest regards,\n[Your Name]",
      });

      await storage.createInterviewPrep({
        resumeId: demoResume.id,
        jobDescription: demoResume.jobDescription!,
        questions: [
          {
            question: "Tell me about a time you optimized application performance.",
            tips: "Use the STAR method. Focus on your 20% database performance improvement. Explain the situation, the specific actions you took (indexing, caching?), and the final measurable result."
          },
          {
            question: "How do you handle mentoring junior developers?",
            tips: "Discuss your experience managing the team of 2 developers. Emphasize your approach to code reviews, pairing, and fostering a collaborative environment."
          }
        ]
      });
      console.log("Database seeded successfully.");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
