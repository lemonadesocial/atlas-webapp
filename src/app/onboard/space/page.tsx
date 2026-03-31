"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { graphqlRequest } from "@/lib/services/graphql-client";
import { STRINGS } from "@/lib/utils/constants";
import { OnboardLayout } from "@/components/onboard/OnboardLayout";
import type { Space } from "@/lib/types/atlas";

const LIST_SPACES_QUERY = `query($limit: Int, $skip: Int) {
  aiListMySpaces(limit: $limit, skip: $skip) {
    items { _id title slug description }
  }
}`;

const CREATE_SPACE_MUTATION = `mutation($input: AISpaceInput!) {
  aiCreateSpace(input: $input) { _id title slug }
}`;

export default function OnboardStep2() {
  const { user, loading: authLoading } = useAuth();
  const { state, updateState, goToStep } = useOnboarding();
  const router = useRouter();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(state.spaceId ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/onboard");
    }
  }, [user, authLoading, router]);

  const fetchSpaces = useCallback(async () => {
    setLoadingSpaces(true);
    setError(null);
    try {
      const res = await graphqlRequest<{
        aiListMySpaces: { items: Space[] };
      }>(LIST_SPACES_QUERY, { limit: 50, skip: 0 });
      const items = res.data?.aiListMySpaces?.items ?? [];
      setSpaces(items);
      if (items.length === 1) {
        setSelectedId(items[0]._id);
      }
    } catch {
      setError("Failed to load spaces. Please try again.");
    } finally {
      setLoadingSpaces(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user, fetchSpaces]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await graphqlRequest<{
        aiCreateSpace: Space;
      }>(CREATE_SPACE_MUTATION, { input: { title: newTitle.trim() } });
      const space = res.data?.aiCreateSpace;
      if (space) {
        setSpaces((prev) => [...prev, space]);
        setSelectedId(space._id);
        setShowCreate(false);
        setNewTitle("");
      }
    } catch {
      setError("Failed to create space. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleContinue = () => {
    if (!selectedId) return;
    const space = spaces.find((s) => s._id === selectedId);
    updateState({
      currentStep: 3,
      spaceId: selectedId,
      spaceName: space?.title,
    });
    goToStep(3);
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" role="status" aria-label="Loading" />
      </div>
    );
  }

  return (
    <OnboardLayout
      step={2}
      title={STRINGS.onboardStep2Title}
      description={STRINGS.onboardStep2Desc}
      onBack={() => goToStep(1)}
    >
      {loadingSpaces ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-md" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={fetchSpaces}
            className="rounded-md bg-btn-tertiary px-4 py-2 text-sm text-btn-tertiary-content hover:bg-btn-tertiary-hover"
          >
            {STRINGS.retry}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {spaces.length > 0 && (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Select a space">
              {spaces.map((space) => (
                <button
                  key={space._id}
                  onClick={() => setSelectedId(space._id)}
                  className={`flex items-center gap-3 rounded-md border p-4 text-left transition-colors ${
                    selectedId === space._id
                      ? "border-accent bg-accent/10"
                      : "border-divider hover:border-card-border-hover"
                  }`}
                  role="radio"
                  aria-checked={selectedId === space._id}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selectedId === space._id
                        ? "border-accent bg-accent"
                        : "border-tertiary"
                    }`}
                  >
                    {selectedId === space._id && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {space.title}
                    </p>
                    {space.description && (
                      <p className="text-xs text-tertiary">{space.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-md border border-dashed border-divider p-4 text-sm text-secondary transition-colors hover:border-accent hover:text-primary"
            >
              + {STRINGS.createNewSpace}
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-md border border-divider p-4">
              <label htmlFor="space-title" className="text-sm font-medium text-primary">
                Space name
              </label>
              <input
                id="space-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="My Organization"
                className="rounded-md border border-divider bg-background px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:border-accent focus:outline-none"
                aria-label="New space name"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || creating}
                  className="rounded-md bg-btn-secondary px-4 py-2 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewTitle("");
                  }}
                  className="rounded-md bg-btn-tertiary px-4 py-2 text-sm text-btn-tertiary-content hover:bg-btn-tertiary-hover"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedId}
            className="mt-2 w-full rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}
    </OnboardLayout>
  );
}
