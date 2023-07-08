import useSWR from "swr";

export interface TaskItem {
  corn: string;
  tag?: string;
  title?: string;
  icon?: string;
  description?: string;
  resource: string;
}

export interface Task {
  name: string;
  description: string;
  gallery: string;
  tasks: TaskItem[];
}

export interface RewriteItem {
  host: string;
  url: string;
  rewrite: string;
  resource: string;
  title: string;
  description: string;
}

export interface Rewrite {
  rewrites: RewriteItem[];
  gallery: string;
}

interface Metadata {
  task: Task;
  rewrite: Rewrite;
}

export function useMetadata() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error, isLoading } = useSWR("/api/metadata.json", fetcher);

  return {
    data: data as Metadata,
    isLoading,
    isError: error,
  };
}
