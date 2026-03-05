import { z } from "zod";
import { 
  insertResumeSchema, 
  resumes, 
  coverLetters, 
  interviewPreps,
  insertCoverLetterSchema,
  insertInterviewPrepSchema
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  resumes: {
    list: {
      method: 'GET' as const,
      path: '/api/resumes' as const,
      responses: {
        200: z.array(z.custom<typeof resumes.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/resumes/:id' as const,
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/resumes' as const,
      input: insertResumeSchema,
      responses: {
        201: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/resumes/:id' as const,
      input: z.object({
        title: z.string().optional(),
        originalContent: z.string().optional(),
        jobDescription: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/resumes/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    optimize: {
      method: 'POST' as const,
      path: '/api/resumes/:id/optimize' as const,
      input: z.object({
        jobDescription: z.string(),
      }),
      responses: {
        200: z.custom<typeof resumes.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    }
  },
  coverLetters: {
    list: {
      method: 'GET' as const,
      path: '/api/cover-letters' as const,
      responses: {
        200: z.array(z.custom<typeof coverLetters.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cover-letters/:id' as const,
      responses: {
        200: z.custom<typeof coverLetters.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/cover-letters/generate' as const,
      input: insertCoverLetterSchema,
      responses: {
        201: z.custom<typeof coverLetters.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cover-letters/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  interviewPreps: {
    list: {
      method: 'GET' as const,
      path: '/api/interview-preps' as const,
      responses: {
        200: z.array(z.custom<typeof interviewPreps.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/interview-preps/:id' as const,
      responses: {
        200: z.custom<typeof interviewPreps.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/interview-preps/generate' as const,
      input: insertInterviewPrepSchema,
      responses: {
        201: z.custom<typeof interviewPreps.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/interview-preps/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
