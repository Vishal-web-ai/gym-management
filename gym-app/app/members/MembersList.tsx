"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Search, Phone, ChevronRight, Loader2, Download, Upload, Smartphone, CheckCircle, X } from "lucide-react";
import type { Member } from "@/lib/types";
import { getMembersPaginated, exportMembersCSV, getOverdueMembers, importMembersCSV } from "@/lib/actions/members";
import { overdueBulkMessage } from "@/lib/whatsapp";
import Modal from "@/components/Modal";
import ProfilePhoto from "@/components/ProfilePhoto";

const filterPill: Record<string, string> = {
  All: "",
  Active: "border-emerald-500/20 text-emerald-400",
  Overdue: "border-red-500/20 text-red-400",
  Frozen: "border-cyan-500/20 text-cyan-400",
  Expired: "border-slate-500/20 text-slate-400",
};

export default function MembersList({
  initial,
  initialHasMore,
}: {
  initial: Member[];
  initialHasMore: boolean;
}) {
  const [members, setMembers] = useState<Member[]>(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = members.filter((m) => {
    const name = m.firstName.toLowerCase();
    const q = search.toLowerCase();
    return (
      (name.includes(q) || m.phone.includes(q)) &&
      (filter === "All" || m.status === filter)
    );
  });

  const [loadError, setLoadError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [reminderError, setReminderError] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadMore() {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getMembersPaginated(members.length, 20);
      setMembers((prev) => [...prev, ...result.members]);
      setHasMore(result.hasMore);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load more members");
    }
    setLoading(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportMembersCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "members.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors min-h-[44px]"
        >
          <Upload size={16} />
          Import CSV
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors min-h-[44px]"
        >
          <Download size={16} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <Modal open={showImport} onClose={() => { setShowImport(false); setImportResult(null); }} className="max-w-md">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Import Members</h3>
            <button
              onClick={() => { setShowImport(false); setImportResult(null); }}
              className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:bg-white/[0.06]"
            >
              <X size={16} />
            </button>
          </div>

          {importResult ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {importResult.created} member{importResult.created !== 1 ? "s" : ""} imported successfully.
              </div>
              {importResult.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-400">{importResult.errors.length} error{importResult.errors.length !== 1 ? "s" : ""}:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-400/80">{err}</p>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => { setShowImport(false); setImportResult(null); }}
                className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white min-h-[44px]"
              >
                Done
              </button>
            </div>
          ) : (
            <form action={async (formData: FormData) => {
              setImporting(true);
              setImportResult(null);
              try {
                const result = await importMembersCSV(formData);
                setImportResult(result);
                setMembers([]);
                setHasMore(false);
              } catch (e) {
                setImportResult({
                  created: 0,
                  errors: [e instanceof Error ? e.message : "Import failed"],
                });
              }
              setImporting(false);
            }}>
              <div className="space-y-4">
                <div className="rounded-lg border border-dashed border-white/[0.12] p-6 text-center">
                  <input
                    ref={fileRef}
                    name="file"
                    type="file"
                    accept=".csv"
                    required
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const label = fileRef.current?.parentElement?.querySelector("[data-file-label]");
                        if (label) label.textContent = file.name;
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center gap-2 mx-auto text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Upload size={24} />
                    <span data-file-label className="text-sm">Click to select CSV file</span>
                  </button>
                  <p className="mt-2 text-xs text-text-muted">Columns: First Name, Phone (required) · Email, Gender, Address, Plan (optional)</p>
                </div>
                <button
                  type="submit"
                  disabled={importing}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white disabled:opacity-50 min-h-[44px]"
                >
                  {importing ? "Importing..." : "Import"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
      <div className="relative animate-fade-in">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted outline-none ring-1 ring-white/[0.08] transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.06]"
        />
      </div>

      {filter === "Overdue" && (
        <div className="animate-slide-up">
          {reminderError && (
            <p className="mb-2 text-xs text-red-400">{reminderError}</p>
          )}
          {reminderSent ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 mb-2">
              <CheckCircle size={16} />
              WhatsApp opened with reminder message for overdue members.
            </div>
          ) : (
            <button
              onClick={async () => {
                setSendingReminder(true);
                setReminderError("");
                try {
                  const members = await getOverdueMembers();
                  if (members.length === 0) {
                    setReminderError("No overdue members found.");
                    setSendingReminder(false);
                    return;
                  }
                  const text = overdueBulkMessage(members);
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  setReminderSent(true);
                } catch (e) {
                  setReminderError(e instanceof Error ? e.message : "Failed to load overdue members");
                }
                setSendingReminder(false);
              }}
              disabled={sendingReminder}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/20 px-4 py-3 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {sendingReminder ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
              {sendingReminder ? "Loading..." : "Send Bulk WhatsApp Reminder"}
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 animate-fade-in">
        {["All", "Active", "Overdue", "Frozen", "Expired"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 min-h-[40px] ${
              filter === f
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : `${filterPill[f]} border border-white/[0.06] bg-white/[0.03] text-text-muted hover:bg-white/[0.06] hover:text-text-primary`
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center animate-scale-in">
            <p className="text-sm text-text-secondary">No members found.</p>
          </div>
        )}
        {filtered.map((member, i) => {
          const del = Math.min(i + 1, 4);
          const name = member.firstName;
          return (
          <div
            key={member.id}
            className="group relative"
          >
            <Link
              href={`/members/${member.id}`}
              className={`glass-card flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.06] hover:-translate-y-0.5 active:scale-[0.97] animate-slide-up delay-${del}`}
            >
              <ProfilePhoto image={member.image} name={member.firstName} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">
                  {name}
                </p>
                <span className="mt-0.5 flex items-center gap-1.5 text-sm text-text-muted">
                  <Phone size={13} />
                  {member.phone}
                </span>
              </div>
              <ChevronRight size={18} className="text-text-muted" />
            </Link>
          </div>
          );
        })}

        {loadError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400 text-center">
            {loadError}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              onClick={loadMore}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-6 py-3 text-sm font-medium text-text-muted transition-all duration-200 hover:bg-white/[0.08] hover:text-text-primary disabled:opacity-50 min-h-[48px]"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
