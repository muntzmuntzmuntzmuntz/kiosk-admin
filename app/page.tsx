"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ActivationCode = {
  id: string;
  code: string;
  description: string | null;
  status: string;
  expiresAt: string;
  deviceId: string | null;
};

type LoadState = "loading" | "ready" | "error";
type ActivationCodeKind = "regular" | "trial";

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

const EXPIRING_SOON_DAYS = 30;
const UPGRADE_YEARS = 10;

function isExpired(code: ActivationCode) {
  return new Date(code.expiresAt).getTime() < Date.now();
}

function daysUntilExpiration(code: ActivationCode) {
  return Math.ceil((new Date(code.expiresAt).getTime() - Date.now()) / 86400000);
}

function isTrialCode(code: ActivationCode) {
  return code.code.startsWith("ZYR");
}

function isAlmostExpired(code: ActivationCode) {
  const days = daysUntilExpiration(code);
  return days >= 0 && days <= EXPIRING_SOON_DAYS;
}

function canUpgradeExpiration(code: ActivationCode) {
  return isTrialCode(code) || isAlmostExpired(code);
}

function getUpgradeExpirationDate() {
  const upgraded = new Date();
  upgraded.setFullYear(upgraded.getFullYear() + UPGRADE_YEARS);
  return upgraded;
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

function PencilIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.7]">
      <path d="M3.75 13.75 3 17l3.25-.75L15 7.5 12.5 5 3.75 13.75Z" />
      <path d="m11.75 5.75 2.5 2.5" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [removingCode, setRemovingCode] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<ActivationCode | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [extendExpiration, setExtendExpiration] = useState(false);
  const [isSavingDescription, setIsSavingDescription] = useState(false);
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

  async function createCode(type: ActivationCodeKind) {
    setIsCreating(true);
    setIsCreateMenuOpen(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/activation-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        throw new Error("Failed to create activation code");
      }

      const data = await fetchCodes({ page: 1, status: statusFilter, device: deviceFilter });
      setCodes(data.codes);
      setTotalCount(data.total);
      setPage(1);
      setLoadState("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsCreating(false);
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

  function openDescriptionEditor(code: ActivationCode) {
    setEditingCode(code);
    setDescriptionDraft(code.description ?? "");
    setExtendExpiration(false);
  }

  function closeDescriptionEditor() {
    if (isSavingDescription) {
      return;
    }

    setEditingCode(null);
    setDescriptionDraft("");
    setExtendExpiration(false);
  }

  async function saveDescription() {
    if (!editingCode) {
      return;
    }

    setIsSavingDescription(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/activation-codes/${editingCode.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: descriptionDraft, extendExpiration }),
      });

      if (!res.ok) {
        throw new Error("Failed to update activation code");
      }

      await refreshCodes();
      closeDescriptionEditor();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSavingDescription(false);
    }
  }

  useEffect(() => {
    const auth = localStorage.getItem("kiosk-admin-authenticated") === "true";
    if (!auth) {
      router.replace("/login");
      return;
    }

    let active = true;
    queueMicrotask(() => {
      if (active) {
        setAuthChecked(true);
      }
    });

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

    return () => {
      active = false;
      controller.abort();
    };
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
  const assignedCodes = codes.filter((code) => code.deviceId).length;
  const activePercentage = totalCodes ? Math.round((activeCodes / totalCodes) * 100) : 0;
  const revokedPercentage = totalCodes ? Math.round((revokedCodes / totalCodes) * 100) : 0;
  const assignedPercentage = totalCodes ? Math.round((assignedCodes / totalCodes) * 100) : 0;

  if (!authChecked) {
    return null;
  }

  const showUpgradeToggle = editingCode ? canUpgradeExpiration(editingCode) : false;
  const upgradedExpiration = getUpgradeExpirationDate();

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
            { label: "Revoked", value: revokedCodes, detail: `${revokedPercentage}% blocked` },
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
              <div
                className="relative"
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsCreateMenuOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateMenuOpen((open) => !open)}
                  disabled={isCreating}
                  aria-haspopup="menu"
                  aria-expanded={isCreateMenuOpen}
                  aria-label="Create new activation code"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-lg font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  +
                </button>
                {isCreateMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => createCode("regular")}
                      disabled={isCreating}
                      className="block h-10 w-full px-4 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      REGULAR
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => createCode("trial")}
                      disabled={isCreating}
                      className="block h-10 w-full px-4 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      TRIAL
                    </button>
                  </div>
                ) : null}
              </div>
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
                Showing {pageStart}-{pageEnd} of {totalCount} codes
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Expires</th>
                    <th className="px-5 py-3">Device</th>
                    <th className="px-5 py-3">Description</th>
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
                          <td className="px-5 py-4 text-zinc-600">
                            {code.description ? (
                              <span className="block max-w-xs truncate" title={code.description}>
                                {code.description}
                              </span>
                            ) : (
                              <span className="text-zinc-400">No description</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openDescriptionEditor(code)}
                                aria-label={`Edit description for ${code.code}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCode(code.code)}
                                disabled={!!code.deviceId}
                                aria-label="Remove code"
                                className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
                              >
                                {removingCode === code.code ? "..." : "X"}
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

      {editingCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-500">Edit activation code</p>
                <h2 className="mt-1 font-mono text-sm font-semibold text-zinc-950">
                  {editingCode.code}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDescriptionEditor}
                className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="Close description editor"
              >
                X
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-zinc-700">
              Description
              <textarea
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value.slice(0, 200))}
                rows={4}
                maxLength={200}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-500"
                placeholder="Add a note for this code, device, or deployment."
              />
            </label>

            <p className="mt-2 text-right text-xs text-zinc-400">
              {descriptionDraft.length}/200
            </p>

            <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-zinc-700">Expiration date</span>
                <span className="text-sm text-zinc-600">
                  {dateFormatter.format(new Date(editingCode.expiresAt))}
                </span>
              </div>

              {showUpgradeToggle ? (
                <label className="mt-4 flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-semibold text-zinc-800">
                      Upgrade expiration
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {extendExpiration
                        ? `New expiration: ${dateFormatter.format(upgradedExpiration)}`
                        : `Available for trial or ${EXPIRING_SOON_DAYS}-day expiry codes`}
                    </span>
                  </span>
                  <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
                    <input
                      type="checkbox"
                      checked={extendExpiration}
                      onChange={(event) => setExtendExpiration(event.target.checked)}
                      disabled={isSavingDescription}
                      className="peer sr-only"
                      aria-label="Extend expiration by 10 years"
                    />
                    <span className="absolute inset-0 rounded-full bg-zinc-300 transition peer-checked:bg-zinc-950 peer-disabled:opacity-60" />
                    <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                  </span>
                </label>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDescriptionEditor}
                disabled={isSavingDescription}
                className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDescription}
                disabled={isSavingDescription}
                className="h-10 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingDescription ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
