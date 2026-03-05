import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertResume } from "@shared/schema";

export function useResumes() {
  return useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: async () => {
      const res = await fetch(api.resumes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return api.resumes.list.responses[200].parse(await res.json());
    },
  });
}

export function useResume(id: number) {
  return useQuery({
    queryKey: [api.resumes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.resumes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch resume");
      return api.resumes.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertResume) => {
      const validated = api.resumes.create.input.parse(data);
      const res = await fetch(api.resumes.create.path, {
        method: api.resumes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create resume");
      return api.resumes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; title?: string; originalContent?: string; jobDescription?: string }) => {
      const validated = api.resumes.update.input.parse(updates);
      const url = buildUrl(api.resumes.update.path, { id });
      const res = await fetch(url, {
        method: api.resumes.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update resume");
      return api.resumes.update.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.resumes.get.path, variables.id] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resumes.delete.path, { id });
      const res = await fetch(url, {
        method: api.resumes.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete resume");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      queryClient.removeQueries({ queryKey: [api.resumes.get.path, id] });
    },
  });
}

export function useOptimizeResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, jobDescription }: { id: number; jobDescription: string }) => {
      const url = buildUrl(api.resumes.optimize.path, { id });
      const res = await fetch(url, {
        method: api.resumes.optimize.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to optimize resume");
      return api.resumes.optimize.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.resumes.get.path, variables.id] });
    },
  });
}
