"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { graphqlRequest } from "@/lib/services/graphql-client";
import { STRINGS } from "@/lib/utils/constants";
import { OnboardLayout } from "@/components/onboard/OnboardLayout";
import type { SpaceConnection, ConnectPlatformResult } from "@/lib/types/atlas";

const CONNECT_PLATFORM_MUTATION = `mutation($input: ConnectPlatformInput!) {
  connectPlatform(input: $input) { connectionId requiresApiKey authUrl }
}`;

const SUBMIT_API_KEY_MUTATION = `mutation($input: SubmitApiKeyInput!) {
  submitApiKey(input: $input) { id connectorType status enabled }
}`;

const SPACE_CONNECTIONS_QUERY = `query($space: MongoID!) {
  spaceConnections(space: $space) { id connectorType status lastSyncAt lastSyncStatus enabled errorMessage }
}`;

interface ConnectorState {
  connecting: boolean;
  connected: boolean;
  error: string | null;
  connectionId: string | null;
  showApiKey: boolean;
  apiKey: string;
  importing: boolean;
  importedCount: number;
}

const initialConnectorState: ConnectorState = {
  connecting: false,
  connected: false,
  error: null,
  connectionId: null,
  showApiKey: false,
  apiKey: "",
  importing: false,
  importedCount: 0,
};

export default function OnboardStep4() {
  const { user, loading: authLoading } = useAuth();
  const { state, updateState, goToStep } = useOnboarding();
  const router = useRouter();

  const [eventbrite, setEventbrite] = useState<ConnectorState>({ ...initialConnectorState });
  const [luma, setLuma] = useState<ConnectorState>({ ...initialConnectorState });
  const [loadingConnections, setLoadingConnections] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/onboard");
    }
  }, [user, authLoading, router]);

  // Fetch existing connections
  const fetchConnections = useCallback(async () => {
    if (!state.spaceId) return;
    setLoadingConnections(true);
    try {
      const res = await graphqlRequest<{
        spaceConnections: SpaceConnection[];
      }>(SPACE_CONNECTIONS_QUERY, { space: state.spaceId });
      const connections = res.data?.spaceConnections ?? [];
      for (const conn of connections) {
        if (conn.connectorType === "eventbrite" && conn.enabled) {
          setEventbrite((prev) => ({ ...prev, connected: true }));
        }
        if (conn.connectorType === "luma" && conn.enabled) {
          setLuma((prev) => ({ ...prev, connected: true }));
        }
      }
    } catch {
      // non-fatal
    } finally {
      setLoadingConnections(false);
    }
  }, [state.spaceId]);

  useEffect(() => {
    if (user && state.spaceId) {
      fetchConnections();
    }
  }, [user, state.spaceId, fetchConnections]);

  const handleConnectEventbrite = async () => {
    if (!state.spaceId) return;
    setEventbrite((prev) => ({ ...prev, connecting: true, error: null }));
    try {
      const res = await graphqlRequest<{
        connectPlatform: ConnectPlatformResult;
      }>(CONNECT_PLATFORM_MUTATION, {
        input: { space: state.spaceId, connectorType: "eventbrite" },
      });
      const result = res.data?.connectPlatform;
      if (result?.authUrl) {
        window.location.href = result.authUrl;
      } else {
        setEventbrite((prev) => ({
          ...prev,
          connecting: false,
          error: "No auth URL returned. Please try again.",
        }));
      }
    } catch {
      setEventbrite((prev) => ({
        ...prev,
        connecting: false,
        error: "Failed to start Eventbrite connection. Please try again.",
      }));
    }
  };

  const handleConnectLuma = async () => {
    if (!state.spaceId) return;
    setLuma((prev) => ({ ...prev, connecting: true, error: null }));
    try {
      const res = await graphqlRequest<{
        connectPlatform: ConnectPlatformResult;
      }>(CONNECT_PLATFORM_MUTATION, {
        input: { space: state.spaceId, connectorType: "luma" },
      });
      const result = res.data?.connectPlatform;
      if (result?.requiresApiKey) {
        setLuma((prev) => ({
          ...prev,
          connecting: false,
          connectionId: result.connectionId,
          showApiKey: true,
        }));
      } else if (result?.authUrl) {
        window.location.href = result.authUrl;
      }
    } catch {
      setLuma((prev) => ({
        ...prev,
        connecting: false,
        error: "Failed to start Lu.ma connection. Please try again.",
      }));
    }
  };

  const handleSubmitLumaKey = async () => {
    if (!luma.connectionId || !luma.apiKey.trim()) return;
    setLuma((prev) => ({ ...prev, connecting: true, error: null }));
    try {
      const res = await graphqlRequest<{
        submitApiKey: { id: string; status: string; enabled: boolean };
      }>(SUBMIT_API_KEY_MUTATION, {
        input: { connectionId: luma.connectionId, apiKey: luma.apiKey.trim() },
      });
      const result = res.data?.submitApiKey;
      if (result?.enabled) {
        setLuma((prev) => ({
          ...prev,
          connecting: false,
          connected: true,
          showApiKey: false,
        }));
      } else {
        setLuma((prev) => ({
          ...prev,
          connecting: false,
          error: STRINGS.invalidApiKey,
        }));
      }
    } catch {
      setLuma((prev) => ({
        ...prev,
        connecting: false,
        error: STRINGS.invalidApiKey,
      }));
    }
  };

  const handleContinue = () => {
    const platforms: string[] = [];
    if (eventbrite.connected) platforms.push("Eventbrite");
    if (luma.connected) platforms.push("Lu.ma");
    updateState({
      currentStep: 5,
      connectedPlatforms: platforms,
      importedEventCount: eventbrite.importedCount + luma.importedCount,
    });
    goToStep(5);
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
      step={4}
      title={STRINGS.onboardStep4Title}
      description={STRINGS.onboardStep4Desc}
      onBack={() => goToStep(3)}
    >
      {loadingConnections ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-20 rounded-md" />
          <div className="skeleton h-20 rounded-md" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Eventbrite connector */}
          <div className="rounded-md border border-divider p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f05537]/10">
                  <span className="text-lg font-bold text-[#f05537]">E</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Eventbrite</p>
                  <p className="text-xs text-tertiary">OAuth connection</p>
                </div>
              </div>
              {eventbrite.connected ? (
                <span className="flex items-center gap-1 text-sm text-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Connected
                </span>
              ) : (
                <button
                  onClick={handleConnectEventbrite}
                  disabled={eventbrite.connecting}
                  className="rounded-md bg-btn-secondary px-4 py-2 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover disabled:opacity-50"
                >
                  {eventbrite.connecting ? "Connecting..." : STRINGS.connectEventbrite}
                </button>
              )}
            </div>
            {eventbrite.error && (
              <p className="mt-2 text-sm text-danger">{eventbrite.error}</p>
            )}
          </div>

          {/* Lu.ma connector */}
          <div className="rounded-md border border-divider p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/10">
                  <span className="text-lg font-bold text-purple-400">L</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Lu.ma</p>
                  <p className="text-xs text-tertiary">API key connection</p>
                </div>
              </div>
              {luma.connected ? (
                <span className="flex items-center gap-1 text-sm text-success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Connected
                </span>
              ) : !luma.showApiKey ? (
                <button
                  onClick={handleConnectLuma}
                  disabled={luma.connecting}
                  className="rounded-md bg-btn-secondary px-4 py-2 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover disabled:opacity-50"
                >
                  {luma.connecting ? "Connecting..." : STRINGS.connectLuma}
                </button>
              ) : null}
            </div>
            {luma.showApiKey && !luma.connected && (
              <div className="mt-3 flex flex-col gap-2">
                <input
                  type="text"
                  value={luma.apiKey}
                  onChange={(e) =>
                    setLuma((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  placeholder={STRINGS.lumaApiKeyPlaceholder}
                  className={`rounded-md border bg-background px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:outline-none ${
                    luma.error
                      ? "border-danger focus:border-danger"
                      : "border-divider focus:border-accent"
                  }`}
                  aria-label="Lu.ma API key"
                  aria-invalid={!!luma.error}
                />
                <button
                  onClick={handleSubmitLumaKey}
                  disabled={!luma.apiKey.trim() || luma.connecting}
                  className="rounded-md bg-btn-secondary px-4 py-2 text-sm font-medium text-btn-secondary-content transition-colors hover:bg-btn-secondary-hover disabled:opacity-50"
                >
                  {luma.connecting ? "Validating..." : "Connect"}
                </button>
              </div>
            )}
            {luma.error && (
              <p className="mt-2 text-sm text-danger">{luma.error}</p>
            )}
          </div>

          {/* Alternative CTA */}
          <div className="border-t border-divider pt-4">
            <a
              href="https://app.lemonade.social/create-event"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-accent transition-colors hover:text-accent-hover"
            >
              {STRINGS.createOnLemonade}
            </a>
          </div>

          <button
            onClick={handleContinue}
            className="mt-2 w-full rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {eventbrite.connected || luma.connected ? "Continue" : "Skip and finish"}
          </button>
        </div>
      )}
    </OnboardLayout>
  );
}
