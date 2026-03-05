import { db } from "./db";
import {
  resumes,
  coverLetters,
  interviewPreps,
  type InsertResume,
  type InsertCoverLetter,
  type InsertInterviewPrep,
  type Resume,
  type CoverLetter,
  type InterviewPrep
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Resumes
  getResumes(): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, updates: Partial<InsertResume>): Promise<Resume>;
  updateResumeOptimization(id: number, data: { optimizedContent: string, atsScore: number, atsFeedback: string }): Promise<Resume>;
  deleteResume(id: number): Promise<void>;

  // Cover Letters
  getCoverLetters(): Promise<CoverLetter[]>;
  getCoverLetter(id: number): Promise<CoverLetter | undefined>;
  createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  deleteCoverLetter(id: number): Promise<void>;

  // Interview Preps
  getInterviewPreps(): Promise<InterviewPrep[]>;
  getInterviewPrep(id: number): Promise<InterviewPrep | undefined>;
  createInterviewPrep(prep: InsertInterviewPrep): Promise<InterviewPrep>;
  deleteInterviewPrep(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Resumes
  async getResumes(): Promise<Resume[]> {
    return await db.select().from(resumes).orderBy(desc(resumes.createdAt));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async updateResume(id: number, updates: Partial<InsertResume>): Promise<Resume> {
    const [updated] = await db.update(resumes)
      .set(updates)
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }

  async updateResumeOptimization(id: number, data: { optimizedContent: string, atsScore: number, atsFeedback: string }): Promise<Resume> {
    const [updated] = await db.update(resumes)
      .set(data)
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }

  async deleteResume(id: number): Promise<void> {
    // Cascade delete manually just in case
    await db.delete(coverLetters).where(eq(coverLetters.resumeId, id));
    await db.delete(interviewPreps).where(eq(interviewPreps.resumeId, id));
    await db.delete(resumes).where(eq(resumes.id, id));
  }

  // Cover Letters
  async getCoverLetters(): Promise<CoverLetter[]> {
    return await db.select().from(coverLetters).orderBy(desc(coverLetters.createdAt));
  }

  async getCoverLetter(id: number): Promise<CoverLetter | undefined> {
    const [cl] = await db.select().from(coverLetters).where(eq(coverLetters.id, id));
    return cl;
  }

  async createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const [newCl] = await db.insert(coverLetters).values(coverLetter).returning();
    return newCl;
  }

  async deleteCoverLetter(id: number): Promise<void> {
    await db.delete(coverLetters).where(eq(coverLetters.id, id));
  }

  // Interview Preps
  async getInterviewPreps(): Promise<InterviewPrep[]> {
    return await db.select().from(interviewPreps).orderBy(desc(interviewPreps.createdAt));
  }

  async getInterviewPrep(id: number): Promise<InterviewPrep | undefined> {
    const [prep] = await db.select().from(interviewPreps).where(eq(interviewPreps.id, id));
    return prep;
  }

  async createInterviewPrep(prep: InsertInterviewPrep): Promise<InterviewPrep> {
    const [newPrep] = await db.insert(interviewPreps).values(prep).returning();
    return newPrep;
  }

  async deleteInterviewPrep(id: number): Promise<void> {
    await db.delete(interviewPreps).where(eq(interviewPreps.id, id));
  }
}

export const storage = new DatabaseStorage();
