import { pgTable, serial, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  originalContent: text("original_content").notNull(),
  jobDescription: text("job_description"),
  optimizedContent: text("optimized_content"),
  atsScore: integer("ats_score"),
  atsFeedback: text("ats_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coverLetters = pgTable("cover_letters", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobDescription: text("job_description").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewPreps = pgTable("interview_preps", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobDescription: text("job_description").notNull(),
  questions: json("questions").notNull(), // Array of { question: string, tips: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  optimizedContent: true,
  atsScore: true,
  atsFeedback: true,
});

export const insertCoverLetterSchema = createInsertSchema(coverLetters).omit({
  id: true,
  createdAt: true,
  content: true,
});

export const insertInterviewPrepSchema = createInsertSchema(interviewPreps).omit({
  id: true,
  createdAt: true,
  questions: true,
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type CoverLetter = typeof coverLetters.$inferSelect;
export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;

export type InterviewPrep = typeof interviewPreps.$inferSelect;
export type InsertInterviewPrep = z.infer<typeof insertInterviewPrepSchema>;

export type OptimizeResumeRequest = {
  resumeId: number;
  jobDescription: string;
};
