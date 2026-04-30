"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ActivationCode = {
  id: string;
  code: string;
  status: string;
  expiresAt: string;
  deviceId: string | null;
};

type LoadState = "loading" | "ready" | "error";

type ActivationCodeListResponse = {
  codes: ActivationCode[];
  total: number;
  page: number;
  limit: number;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function isExpired(code: ActivationCode) {
  return new Date(code.expiresAt).getTime() < Date.now();
}

function displayStatus(code: ActivationCode) {
  if (code.status === "revoked") {
    return "revoked";
  }

  if (isExpired(code)) {
    return "expired";
  }

  return code.status;
}

function statusClass(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "revoked":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "expired":
      return "border-zinc-200 bg-zinc-100 text-zinc-600";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default function Home() {
  const router = useRouter();
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isCreating, setIsCreating] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [revokingCode, setRevokingCode] = useState<string | null>(null);
  const [removingCode, setRemovingCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked" | "expired">("all");
  const [deviceFilter, setDeviceFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 8;

  const fetchCodes = useCallback(
    async (
      params: { page: number; status: string; device: string },
      signal?: AbortSignal,
    ) => {
      const query = new URLSearchParams({
        page: String(params.page),
        limit: String(LIMIT),
      });

      if (params.status !== "all") {
        query.set("status", params.status);
      }

      if (params.device !== "all") {
        query.set("device", params.device);
      }

      const res = await fetch(`/api/activation-codes/list?${query.toString()}`, { signal });

      if (!res.ok) {
        throw new Error("Failed to load activation codes");
      }

      return (await res.json()) as ActivationCodeListResponse;
    },
    [LIMIT],
  );

  async function refreshCodes() {
    setLoadState("loading");
    const data = await fetchCodes({ page, status: statusFilter, device: deviceFilter });
    setCodes(data.codes);
    setTotalCount(data.total);
    setLoadState("ready");
  }

  async function createCode() {
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/activation-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to create activation code");
      }

      await refreshCodes();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsCreating(false);
    }
  }

  async function revoke(code: string) {
    setRevokingCode(code);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/activation-codes/${code}/revoke`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Failed to revoke activation code");
      }

      await refreshCodes();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setRevokingCode(null);
    }
  }

  async function removeCode(code: string) {
    if (!window.confirm("Remove this activation code permanently?")) {
      return;
    }

    setRemovingCode(code);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/activation-codes/${code}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove activation code");
      }

      await refreshCodes();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setRemovingCode(null);
    }
  }

  useEffect(() => {
    const auth = localStorage.getItem("kiosk-admin-authenticated") === "true";
    if (!auth) {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
    const controller = new AbortController();

    fetchCodes({ page, status: statusFilter, device: deviceFilter }, controller.signal)
      .then((data) => {
        setCodes(data.codes);
        setTotalCount(data.total);
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setLoadState("error");
        setErrorMessage("Failed to load activation codes");
        console.error(error);
      });

    return () => controller.abort();
  }, [fetchCodes, page, statusFilter, deviceFilter, router]);

  const totalCodes = totalCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));
  const pageStart = totalCount === 0 ? 0 : (page - 1) * LIMIT + 1;
  const pageEnd = Math.min(totalCount, page * LIMIT);

  function handleLogout() {
    localStorage.removeItem("kiosk-admin-authenticated");
    router.replace("/login");
  }
  const activeCodes = codes.filter((code) => displayStatus(code) === "active").length;
  const revokedCodes = codes.filter((code) => displayStatus(code) === "revoked").length;
  const expiredCodes = codes.filter((code) => displayStatus(code) === "expired").length;
  const assignedCodes = codes.filter((code) => code.deviceId).length;
  const activePercentage = totalCodes ? Math.round((activeCodes / totalCodes) * 100) : 0;
  const revokedPercentage = totalCodes ? Math.round((revokedCodes / totalCodes) * 100) : 0;
  const expiredPercentage = totalCodes ? Math.round((expiredCodes / totalCodes) * 100) : 0;
  const assignedPercentage = totalCodes ? Math.round((assignedCodes / totalCodes) * 100) : 0;
  if (!authChecked) {
    return null;
  }

  const chartStyle = {
    background: totalCodes
      ? `conic-gradient(#059669 0 ${activePercentage}%, #e11d48 ${activePercentage}% ${
          activePercentage + revokedPercentage
        }%, #71717a ${activePercentage + revokedPercentage}% ${
          activePercentage + revokedPercentage + expiredPercentage
        }%, #e4e4e7 ${activePercentage + revokedPercentage + expiredPercentage}% 100%)`
      : "#e4e4e7",
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Kiosk Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Activation codes</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refreshCodes}
              className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loadState === "loading" || isCreating}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100"
            >
              Logout
            </button>
          </div>
        </header>

        {errorMessage ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total", value: totalCodes, detail: "All generated codes" },
            { label: "Active", value: activeCodes, detail: `${activePercentage}% available` },
            { label: "Assigned", value: assignedCodes, detail: `${assignedPercentage}% bound to devices` },
            { label: "Revoked", value: revokedCodes, detail: "Blocked from validation" },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">{stat.value}</p>
              <p className="mt-1 text-sm text-zinc-500">{stat.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex min-h-16 flex-col gap-4 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-950">Recent codes</h2>
                <p className="mt-1 text-sm text-zinc-500">Newest generated codes first</p>
              </div>
              <button
                type="button"
                onClick={createCode}
                disabled={isCreating}
                aria-label="Create new activation code"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-lg font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <label className="flex flex-col text-sm font-medium text-zinc-700">
                  <span className="mb-1">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setPage(1);
                      setStatusFilter(event.target.value as "all" | "active" | "revoked" | "expired");
                    }}
                    className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-500 focus:outline-none"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="revoked">Revoked</option>
                    <option value="expired">Expired</option>
                  </select>
                </label>
                <label className="flex flex-col text-sm font-medium text-zinc-700">
                  <span className="mb-1">Device</span>
                  <select
                    value={deviceFilter}
                    onChange={(event) => {
                      setPage(1);
                      setDeviceFilter(event.target.value as "all" | "assigned" | "unassigned");
                    }}
                    className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm transition focus:border-zinc-500 focus:outline-none"
                  >
                    <option value="all">All devices</option>
                    <option value="assigned">Assigned only</option>
                    <option value="unassigned">Unassigned only</option>
                  </select>
                </label>
              </div>
              <p className="text-sm text-zinc-500">
                Showing {pageStart}–{pageEnd} of {totalCount} codes
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Expires</th>
                    <th className="px-5 py-3">Device</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loadState === "loading" ? (
                    <tr>
                      <td className="px-5 py-10 text-center text-zinc-500" colSpan={6}>
                        Loading activation codes...
                      </td>
                    </tr>
                  ) : codes.length === 0 ? (
                    <tr>
                      <td className="px-5 py-10 text-center text-zinc-500" colSpan={6}>
                        No activation codes yet.
                      </td>
                    </tr>
                  ) : (
                    codes.map((code) => {
                      const status = displayStatus(code);
                      const canRevoke = status !== "revoked";

                      return (
                        <tr key={code.id} className="hover:bg-zinc-50">
                          <td className="px-5 py-4">
                            <span className="font-mono text-sm font-medium text-zinc-950">
                              {code.code}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold capitalize ${statusClass(
                                status,
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-zinc-600">
                            {dateFormatter.format(new Date(code.expiresAt))}
                          </td>
                          <td className="px-5 py-4 text-zinc-600">
                            {code.deviceId ? (
                              <span className="font-mono text-xs">{code.deviceId}</span>
                            ) : (
                              <span className="text-zinc-400">Unassigned</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => revoke(code.code)}
                                disabled={!canRevoke || revokingCode === code.code || removingCode === code.code}
                                aria-label={status === "revoked" ? "Already revoked" : "Revoke code"}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
                              >
                                {revokingCode === code.code ? "…" : "×"}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCode(code.code)}
                                disabled={!!code.deviceId}
                                aria-label="Remove code"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
                              >
                                {removingCode === code.code ? "…" : "🗑"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
