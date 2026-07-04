"use client";

import { useState, useRef } from "react";
import { Edit3, Trash2, AlertCircle, Dumbbell, Pencil, X, Check, Download, Upload, HardDrive, MapPin } from "lucide-react";
import { updateGymName, updateOwnerName, updateGymLocation } from "@/lib/actions/settings";
import { createPlan, updatePlan, deletePlan } from "@/lib/actions/plans";
import { exportBackup, importBackup } from "@/lib/actions/backup";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function SettingsClient({
  config,
  plans,
}: {
  config: { gymName: string; ownerName: string | null; gymLat: number | null; gymLng: number | null; gymRadius: number | null };
  plans: { id: string; name: string; price: number; durationDays: number }[];
}) {
  const [editing, setEditing] = useState(false);
  const [ownerName, setOwnerName] = useState(config.ownerName ?? "");
  const [gymName, setGymName] = useState(config.gymName);
  const [saving, setSaving] = useState(false);

  const [plansList, setPlansList] = useState(plans);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanMonths, setNewPlanMonths] = useState("1");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState("");
  const [editPlanPrice, setEditPlanPrice] = useState("");
  const [editPlanMonths, setEditPlanMonths] = useState("");
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([updateOwnerName(ownerName), updateGymName(gymName)]);
      setEditing(false);
    } catch {}
    setSaving(false);
  }

  function startEditPlan(plan: { id: string; name: string; price: number; durationDays: number }) {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(String(plan.price));
    setEditPlanMonths(String(Math.round(plan.durationDays / 30)));
  }

  async function saveEditPlan(id: string) {
    try {
      await updatePlan(id, editPlanName, Number(editPlanPrice), Number(editPlanMonths) * 30);
      setPlansList((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, name: editPlanName, price: Number(editPlanPrice), durationDays: Number(editPlanMonths) * 30 } : p,
        ),
      );
      setEditingPlanId(null);
    } catch {}
  }

  async function handleCreatePlan() {
    if (!newPlanName || !newPlanPrice) return;
    try {
      const plan = await createPlan(newPlanName, Number(newPlanPrice), Number(newPlanMonths) * 30);
      setPlansList((prev) => [...prev, plan]);
      setShowCreatePlan(false);
      setNewPlanName("");
      setNewPlanPrice("");
      setNewPlanMonths("1");
    } catch {}
  }

  async function handleDeletePlan(id: string) {
    try {
      await deletePlan(id);
      setPlansList((prev) => prev.filter((p) => p.id !== id));
      setDeletePlanId(null);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">General Information</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary min-h-[36px]"
            >
              <Edit3 size={14} />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOwnerName(config.ownerName ?? "");
                  setGymName(config.gymName);
                  setEditing(false);
                }}
                className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-medium text-text-muted min-h-[36px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white min-h-[36px] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            {editing ? (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Owner Name</label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none"
                />
              </div>
            ) : (
              <p className="text-sm font-semibold"><span className="text-amber-400">Owner Name :</span> <span className="text-white">{ownerName}</span></p>
            )}
          </div>

          <div>
            {editing ? (
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Gym Name</label>
                <input
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none"
                />
              </div>
            ) : (
              <p className="text-sm font-semibold"><span className="text-amber-400">Gym Name :</span> <span className="text-white">{gymName}</span></p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Membership Plans</label>
            {plansList.length === 0 ? (
              <p className="text-sm text-text-muted">No plans created yet.</p>
            ) : (
              <div className="space-y-2">
                {plansList.map((plan) => (
                  <div key={plan.id}>
                    {editingPlanId === plan.id ? (
                      <div className="rounded-lg bg-white/[0.03] p-3 space-y-3">
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-xs text-text-muted">Name</label>
                            <input
                              value={editPlanName}
                              onChange={(e) => setEditPlanName(e.target.value)}
                              className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-text-primary outline-none"
                            />
                          </div>
                          <div className="w-20 space-y-1">
                            <label className="text-xs text-text-muted">Price</label>
                            <input
                              type="number"
                              value={editPlanPrice}
                              onChange={(e) => setEditPlanPrice(e.target.value)}
                              className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-text-primary outline-none"
                            />
                          </div>
                          <div className="w-18 space-y-1">
                            <label className="text-xs text-text-muted">Months</label>
                            <input
                              type="number"
                              min="1"
                              value={editPlanMonths}
                              onChange={(e) => setEditPlanMonths(e.target.value)}
                              className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-text-primary outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingPlanId(null)}
                            className="flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-text-muted"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEditPlan(plan.id)}
                            className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white"
                          >
                            <Check size={12} />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-4 py-3">
                        <Dumbbell size={16} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{plan.name}</p>
                          <p className="text-xs text-text-muted">
                            ₹{plan.price.toLocaleString("en-IN")} · {Math.round(plan.durationDays / 30)} months
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditPlan(plan)}
                            className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeletePlanId(plan.id)}
                            className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              )}

              <button
                onClick={() => setShowCreatePlan(!showCreatePlan)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/[0.12] px-4 py-2.5 text-xs font-medium text-text-muted transition-all duration-200 hover:border-primary/30 hover:text-primary"
              >
                + Create Plan
              </button>

              {showCreatePlan && (
                <div className="mt-2 rounded-lg bg-white/[0.03] p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-text-muted">Name</label>
                      <input
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        placeholder="e.g. Gold"
                        className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <label className="text-xs text-text-muted">Price</label>
                      <input
                        type="number"
                        value={newPlanPrice}
                        onChange={(e) => setNewPlanPrice(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                      />
                    </div>
                    <div className="w-18 space-y-1">
                      <label className="text-xs text-text-muted">Months</label>
                      <input
                        type="number"
                        min="1"
                        value={newPlanMonths}
                        onChange={(e) => setNewPlanMonths(e.target.value)}
                        className="w-full rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-text-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCreatePlan(false)}
                      className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePlan}
                      className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white"
                    >
                      Add Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <MapPin size={16} />
            Gym Location (GPS)
          </h2>
        </div>
        <p className="text-xs text-text-muted">Set your gym&apos;s GPS coordinates so the member app can verify check-ins via location.</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Latitude</label>
            <input
              type="number" step="any"
              defaultValue={config.gymLat ?? ""}
              id="gym-lat"
              placeholder="e.g. 19.0760"
              className="w-full rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Longitude</label>
            <input
              type="number" step="any"
              defaultValue={config.gymLng ?? ""}
              id="gym-lng"
              placeholder="e.g. 72.8777"
              className="w-full rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Radius (m)</label>
            <input
              type="number"
              defaultValue={config.gymRadius ?? ""}
              id="gym-radius"
              placeholder="e.g. 100"
              className="w-full rounded-lg bg-white/[0.04] px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none"
            />
          </div>
        </div>
        <button
          onClick={async () => {
            const lat = parseFloat((document.getElementById("gym-lat") as HTMLInputElement).value);
            const lng = parseFloat((document.getElementById("gym-lng") as HTMLInputElement).value);
            const radius = parseFloat((document.getElementById("gym-radius") as HTMLInputElement).value);
            if (isNaN(lat) || isNaN(lng) || isNaN(radius)) return;
            await updateGymLocation(lat, lng, radius);
          }}
          className="rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary hover:bg-primary/20 transition-all"
        >
          Save Location
        </button>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <HardDrive size={16} />
            Backup & Restore
          </h2>
        </div>

        {backupError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{backupError}</span>
          </div>
        )}

        {restoreResult && (
          <div className="rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {restoreResult}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={async () => {
              setBackingUp(true);
              setBackupError(null);
              try {
                const json = await exportBackup();
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `gym-backup-${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              } catch (e: any) {
                setBackupError(e?.message || "Backup failed");
              }
              setBackingUp(false);
            }}
            disabled={backingUp}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-all hover:bg-primary/20 active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
          >
            <Download size={16} />
            {backingUp ? "Exporting..." : "Export Backup"}
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={restoring}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary active:scale-[0.98] disabled:opacity-50 min-h-[44px]"
          >
            <Upload size={16} />
            {restoring ? "Restoring..." : "Restore Backup"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setRestoring(true);
              setBackupError(null);
              setRestoreResult(null);
              try {
                const fd = new FormData();
                fd.set("file", file);
                const result = await importBackup(fd);
                setRestoreResult(
                  `Restored: ${result.members} members, ${result.payments} payments, ${result.plans} plans, ${result.expenses} expenses, ${result.attendance} attendance records.`
                );
              } catch (err: any) {
                setBackupError(err?.message || "Restore failed");
              }
              setRestoring(false);
              e.target.value = "";
            }}
          />
        </div>
        <p className="text-xs text-text-muted">Backup exports all data as JSON. Restore overwrites existing records.</p>
      </div>

      <ConfirmDialog
        open={deletePlanId !== null}
        onClose={() => setDeletePlanId(null)}
        title="Delete Plan?"
        description="Members assigned to this plan will lose their plan reference."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => deletePlanId && handleDeletePlan(deletePlanId)}
      />
    </div>
  );
}
