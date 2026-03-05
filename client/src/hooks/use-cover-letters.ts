import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCoverLetter } from "@shared/schema";

export function useCoverLetters() {
  return useQuery({
    queryKey: [api.coverLetters.list.path],
    queryFn: async () => {
      const res = await fetch(api.coverLetters.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cover letters");
      return api.coverLetters.list.responses[200].parse(await res.json());
    },
  });
}

export function useCoverLetter(id: number) {
  return useQuery({
    queryKey: [api.coverLetters.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.coverLetters.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch cover letter");
      return api.coverLetters.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useGenerateCoverLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCoverLetter) => {
      const validated = api.coverLetters.generate.input.parse(data);
      const res = await fetch(api.coverLetters.generate.path, {
        method: api.coverLetters.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate cover letter");
      return api.coverLetters.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.coverLetters.list.path] });
    },
  });
}

export function useDeleteCoverLetter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.coverLetters.delete.path, { id });
      const res = await fetch(url, {
        method: api.coverLetters.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete cover letter");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.coverLetters.list.path] });
      queryClient.removeQueries({ queryKey: [api.coverLetters.get.path, id] });
    },
  });
}
