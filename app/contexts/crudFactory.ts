"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

interface BaseEntity {
  id: number;
}

interface CrudContextType<T> {
  list: T[];
  loading: boolean;
  errors: Record<string, string | null>;
  fetchAll: () => Promise<void>;
  create: (data: Omit<T, "id">) => Promise<T | null>;
  update: (id: number, data: Partial<T>) => Promise<T | null>;
  remove: (id: number) => Promise<boolean>;
}

interface CrudOptions<T> {
  transform?: (data: any) => T;
  validateCreate?: (data: Omit<T, "id">, list: T[]) => string | null;
  validateUpdate?: (id: number, data: Partial<T>, list: T[]) => string | null;
}

export function createCrudContext<T extends BaseEntity>(
  endpoint: string,
  options?: CrudOptions<T>
) {
  const Context = createContext<CrudContextType<T> | undefined>(undefined);

  function Provider({ children }: { children: ReactNode }) {
    const [list, setList] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    const setError = (op: string, message: string | null) => {
      setErrors(prev => ({ ...prev, [op]: message }));
    };

    const fetchAll = useCallback(async () => {
      setLoading(true);
      setError("fetch", null);

      try {
        const res = await fetchWithAuth(`/api/${endpoint}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        const rawList = data?.data || data;

        const finalList = options?.transform
          ? rawList.map(options.transform)
          : rawList;

        setList(finalList);
      } catch {
        setError("fetch", "Failed to fetch");
      } finally {
        setLoading(false);
      }
    }, [endpoint]);

    useEffect(() => {
      fetchAll();
    }, [fetchAll]);

    const create = async (data: Omit<T, "id">) => {
      try {
        const validationError =
          options?.validateCreate?.(data, list) ?? null;

        if (validationError) {
          setError("create", validationError);
          return null;
        }

        const res = await fetchWithAuth(`/api/${endpoint}`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Create failed");

        const raw = await res.json();
        const newItem = options?.transform
          ? options.transform(raw)
          : raw;

        setList(prev => [...prev, newItem]);
        return newItem;
      } catch {
        setError("create", "Failed to create");
        return null;
      }
    };

    const update = async (id: number, data: Partial<T>) => {
      try {
        const validationError =
          options?.validateUpdate?.(id, data, list) ?? null;

        if (validationError) {
          setError("update", validationError);
          return null;
        }

        const res = await fetchWithAuth(`/api/${endpoint}/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Update failed");

        const raw = await res.json();
        const updated = options?.transform
          ? options.transform(raw)
          : raw;

        setList(prev =>
          prev.map(i => (i.id === id ? updated : i))
        );

        return updated;
      } catch {
        setError("update", "Failed to update");
        return null;
      }
    };

    const remove = async (id: number) => {
      try {
        const res = await fetchWithAuth(`/api/${endpoint}/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Delete failed");

        setList(prev => prev.filter(i => i.id !== id));
        return true;
      } catch {
        setError("delete", "Failed to delete");
        return false;
      }
    };

    return React.createElement(
      Context.Provider,
      { value: { list, loading, errors, fetchAll, create, update, remove } },
      children
    );
  }

  const useCrud = () => {
    const ctx = useContext(Context);
    if (!ctx) throw new Error("useCrud must be inside Provider");
    return ctx;
  };

  return { Provider, useCrud };
}