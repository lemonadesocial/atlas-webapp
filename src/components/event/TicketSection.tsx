"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/lib/utils/constants";
import { formatPrice, timeUntil } from "@/lib/utils/format";
import type { TicketType, PurchaseHold, CheckoutSession, Receipt } from "@/lib/types/atlas";

interface TicketSectionProps {
  eventId: string;
  ticketTypes: TicketType[];
  isExternal: boolean;
  externalUrl?: string;
  externalPlatform?: string;
}

type PurchaseState =
  | "idle"
  | "selecting"
  | "processing"
  | "holding"
  | "redirecting"
  | "success"
  | "error"
  | "expired"
  | "cancelled";

export function TicketSection({
  eventId,
  ticketTypes,
  isExternal,
  externalUrl,
  externalPlatform,
}: TicketSectionProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [purchaseState, setPurchaseState] = useState<PurchaseState>("idle");
  const [hold, setHold] = useState<PurchaseHold | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Check URL params for payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const holdId = params.get("hold_id");

    if (payment === "success" && holdId) {
      setPurchaseState("success");
      pollReceipt(holdId);
    } else if (payment === "cancelled") {
      setPurchaseState("cancelled");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hold expiry countdown
  useEffect(() => {
    if (!hold?.expires_at) return;
    const interval = setInterval(() => {
      const remaining = timeUntil(hold.expires_at);
      setCountdown(remaining);
      if (remaining === "Expired") {
        setPurchaseState("expired");
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hold?.expires_at]);

  const pollReceipt = useCallback(
    async (holdId: string) => {
      const maxAttempts = 20;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const res = await fetch(`/api/atlas/receipts/by-hold/${holdId}`);
          if (!res.ok) throw new Error("Failed to fetch receipt");
          const data: Receipt = await res.json();
          if (data.status === "completed") {
            setReceipt(data);
            return;
          }
          if (data.status === "expired") {
            setErrorMsg(STRINGS.reservationExpired);
            setPurchaseState("error");
            return;
          }
        } catch {
          // continue polling
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      // After max attempts, show graceful degradation
      setReceipt({ status: "completed" });
    },
    []
  );

  const handlePurchase = async () => {
    const selectedTickets = Object.entries(quantities).filter(
      ([, qty]) => qty > 0
    );
    if (selectedTickets.length === 0) return;

    if (!attendeeName || !attendeeEmail) {
      setErrorMsg("Please enter your name and email.");
      return;
    }

    setPurchaseState("processing");
    setErrorMsg("");

    try {
      // Step 1: Create hold
      const [ticketTypeId, quantity] = selectedTickets[0];
      const holdRes = await fetch(`/api/atlas/events/${eventId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_type_id: ticketTypeId,
          quantity,
          attendee_info: [{ name: attendeeName, email: attendeeEmail }],
        }),
      });

      if (holdRes.status === 402) {
        const holdData: PurchaseHold = await holdRes.json();
        setHold(holdData);
        setPurchaseState("holding");

        // Step 2: Create checkout session
        const checkoutRes = await fetch(
          `/api/atlas/holds/${holdData.hold_id}/checkout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              success_url: `${window.location.origin}/events/${eventId}?payment=success&hold_id=${holdData.hold_id}`,
              cancel_url: `${window.location.origin}/events/${eventId}?payment=cancelled&hold_id=${holdData.hold_id}`,
            }),
          }
        );

        if (!checkoutRes.ok) throw new Error("Failed to create checkout");
        const checkout: CheckoutSession = await checkoutRes.json();
        setPurchaseState("redirecting");
        window.location.href = checkout.checkout_url;
      } else if (holdRes.ok) {
        // Free ticket RSVP
        setPurchaseState("success");
        setReceipt({ status: "completed" });
      } else {
        throw new Error("Failed to reserve tickets");
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unable to reserve tickets. Please try again."
      );
      setPurchaseState("error");
    }
  };

  // External events
  if (isExternal) {
    return (
      <div className="rounded-lg border border-card-border bg-card p-6">
        <h3 className="text-lg font-semibold text-primary">Tickets</h3>
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Get Tickets on {externalPlatform || "source platform"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    );
  }

  // Success state
  if (purchaseState === "success") {
    return (
      <div className="rounded-lg border border-success/20 bg-success/5 p-6">
        <h3 className="text-lg font-semibold text-success">
          {receipt?.receipt ? "Tickets confirmed!" : STRINGS.paymentSuccess}
        </h3>
        {receipt?.receipt ? (
          <div className="mt-4 space-y-2">
            {receipt.receipt.tickets.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md bg-card p-3"
              >
                <span className="text-sm text-primary">{t.ticket_type}</span>
                <span className="text-sm text-secondary">{t.attendee_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-secondary">
            {STRINGS.ticketsProcessing}
          </p>
        )}
      </div>
    );
  }

  // Cancelled state
  if (purchaseState === "cancelled") {
    return (
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-6">
        <p className="text-sm text-warning">{STRINGS.paymentCancelled}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => setPurchaseState("idle")}
        >
          Try again
        </Button>
      </div>
    );
  }

  // Expired state
  if (purchaseState === "expired") {
    return (
      <div className="rounded-lg border border-warning/20 bg-warning/5 p-6">
        <p className="text-sm text-warning">{STRINGS.reservationExpired}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => {
            setHold(null);
            setPurchaseState("idle");
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-card-border bg-card p-6">
      <h3 className="text-lg font-semibold text-primary">Tickets</h3>

      {/* Ticket type list */}
      <div className="mt-4 space-y-3">
        {ticketTypes.map((ticket) => {
          const soldOut = ticket.remaining === 0;
          return (
            <div
              key={ticket.id}
              className="flex items-center justify-between rounded-md border border-card-border p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-primary">{ticket.name}</p>
                {ticket.description && (
                  <p className="mt-1 text-xs text-tertiary">
                    {ticket.description}
                  </p>
                )}
                <p className="mt-1 text-sm text-secondary">
                  {formatPrice(ticket.price, ticket.currency)}
                </p>
                {ticket.remaining !== undefined && ticket.remaining > 0 && (
                  <p className="mt-1 text-xs text-tertiary">
                    {ticket.remaining} remaining
                  </p>
                )}
              </div>
              {soldOut ? (
                <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-medium text-danger">
                  {STRINGS.soldOut}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-card-border text-secondary hover:bg-card-hover"
                    onClick={() =>
                      setQuantities((q) => ({
                        ...q,
                        [ticket.id]: Math.max(0, (q[ticket.id] || 0) - 1),
                      }))
                    }
                    aria-label={`Decrease ${ticket.name} quantity`}
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm text-primary">
                    {quantities[ticket.id] || 0}
                  </span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-card-border text-secondary hover:bg-card-hover"
                    onClick={() =>
                      setQuantities((q) => ({
                        ...q,
                        [ticket.id]: Math.min(
                          ticket.max_per_order || 10,
                          (q[ticket.id] || 0) + 1
                        ),
                      }))
                    }
                    aria-label={`Increase ${ticket.name} quantity`}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attendee info */}
      {Object.values(quantities).some((q) => q > 0) && (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={attendeeName}
            onChange={(e) => setAttendeeName(e.target.value)}
            className="w-full rounded-md border border-card-border bg-card px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:border-accent focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your email"
            value={attendeeEmail}
            onChange={(e) => setAttendeeEmail(e.target.value)}
            className="w-full rounded-md border border-card-border bg-card px-3 py-2 text-sm text-primary placeholder:text-quaternary focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {/* Hold countdown */}
      {purchaseState === "holding" && hold && (
        <div className="mt-3 text-center text-sm text-warning">
          Reservation expires in {countdown}
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <p className="mt-3 text-sm text-danger">{errorMsg}</p>
      )}

      {/* Purchase button */}
      <Button
        variant="primary"
        size="lg"
        className="mt-6 w-full"
        disabled={
          !Object.values(quantities).some((q) => q > 0) ||
          purchaseState === "processing" ||
          purchaseState === "redirecting"
        }
        onClick={handlePurchase}
      >
        {purchaseState === "processing" || purchaseState === "redirecting"
          ? STRINGS.processing
          : STRINGS.getTickets}
      </Button>
    </div>
  );
}
