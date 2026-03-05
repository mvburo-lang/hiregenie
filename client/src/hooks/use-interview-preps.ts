import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertInterviewPrep } from "@shared/schema";

export function useInterviewPreps() {
  return useQuery({
    queryKey: [api.interviewPreps.list.path],
    queryFn: async () => {
      const res = await fetch(api.interviewPreps.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interview preps");
      return api.interviewPreps.list.responses[200].parse(await res.json());
    },
  });
}

export function useInterviewPrep(id: number) {
  return useQuery({
    queryKey: [api.interviewPreps.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.interviewPreps.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch interview prep");
      return api.interviewPreps.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useGenerateInterviewPrep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertInterviewPrep) => {
      const validated = api.interviewPreps.generate.input.parse(data);
      const res = await fetch(api.interviewPreps.generate.path, {
        method: api.interviewPreps.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate interview prep");
      return api.interviewPreps.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviewPreps.list.path] });
    },
  });
}

export function useDeleteInterviewPrep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.interviewPreps.delete.path, { id });
      const res = await fetch(url, {
        method: api.interviewPreps.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete interview prep");
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.interviewPreps.list.path] });
      queryClient.removeQueries({ queryKey: [api.interviewPreps.get.path, id] });
    },
  });
}
