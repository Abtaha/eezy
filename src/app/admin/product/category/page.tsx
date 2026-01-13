"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function CategoryPage() {
  const utils = api.useUtils();

  const { data: categories, isLoading } = api.category.getAll.useQuery();

  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      setName("");
      setDescription("");
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate({
      name,
      description: description || null,
    });
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Categories</h1>

      {/* Create category */}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="w-full rounded border p-2"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full rounded border p-2"
        />

        <button
          type="submit"
          disabled={createCategory.isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {createCategory.isPending ? "Creating..." : "Add Category"}
        </button>
      </form>

      {/* Category list */}
      <div className="space-y-2">
        {isLoading && <p>Loading...</p>}

        {categories?.map((cat) => (
          <div key={cat.name} className="rounded border p-2">
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
}
