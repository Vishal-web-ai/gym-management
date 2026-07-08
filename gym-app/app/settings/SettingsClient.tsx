"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit3, Trash2, AlertCircle, Dumbbell, Pencil, X, Check, Download, Upload, HardDrive, MapPin } from "lucide-react";
import { updateGymName, updateOwnerName, updateGymLocation } from "@/lib/actions/settings";
import { createPlan, updatePlan, deletePlan } from "@/lib/actions/plans";
import { exportBackup, importBackup } from "@/lib/actions/backup";
import ConfirmDialog from "@/components/ConfirmDialog";

const springGentle = { type: "spring" as const, stiffness: 200, damping: 25, mass: 1 };

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
  const [locationEditing, setLocationEditing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "saving" | "saved">("idle");
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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.05 }}
        className="glass-card rounded-xl p-5 space-y-1"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">General Information</h2>
          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary min-h-[36px]"
            >
              <Edit3 size={14} />
              Edit
            </motion.button>
          ) : (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setOwnerName(config.ownerName ?? "");
                  setGymName(config.gymName);
                  setEditing(false);
                }}
                className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-medium text-text-muted min-h-[36px]"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-white min-h-[36px] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </motion.button>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <div>
            {editing ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-xs font-medium text-text-muted mb-1.5">Owner Name</label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none"
                />
              </motion.div>
            ) : (
              <p className="text-sm"><span className="text-amber-400">Owner Name :</span> <span className="text-white">{ownerName}</span></p>
            )}
          </div>

          <div>
            {editing ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-xs font-medium text-text-muted mb-1.5">Gym Name</label>
                <input
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none"
                />
              </motion.div>
            ) : (
              <p className="text-sm"><span className="text-amber-400">Gym Name :</span> <span className="text-white">{gymName}</span></p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
        className="glass-card rounded-xl p-5"
      >
        <h2 className="text-lg font-semibold text-primary mb-3">Membership Plans</h2>
        {plansList.length === 0 ? (
          <p className="text-sm text-text-muted">No plans created yet.</p>
        ) : (
          <div className="space-y-2">
            {plansList.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springGentle, delay: 0.15 + i * 0.04 }}
              >
                {editingPlanId === plan.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-white/[0.03] p-3 space-y-3"
                  >
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
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditingPlanId(null)}
                        className="flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-text-muted"
                      >
                        <X size={12} />
                        Cancel
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => saveEditPlan(plan.id)}
                        className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white"
                      >
                        <Check size={12} />
                        Save
                      </motion.button>
                    </div>
                  </motion.div>
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
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEditPlan(plan)}
                        className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil size={13} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeletePlanId(plan.id)}
                        className="flex size-8 items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreatePlan(!showCreatePlan)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/[0.12] px-4 py-2.5 text-xs font-medium text-text-muted hover:border-primary/30 hover:text-primary transition-all"
        >
          + Create Plan
        </motion.button>

        <AnimatePresence>
          {showCreatePlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ...springGentle }}
              className="mt-2 rounded-lg bg-white/[0.03] p-3 space-y-3 overflow-hidden"
            >
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
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreatePlan(false)}
                  className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-text-muted"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreatePlan}
                  className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-white"
                >
                  Add Plan
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.15 }}
        className="glass-card rounded-xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <MapPin size={16} />
            Gym Location (GPS)
          </h2>
          {!locationEditing ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocationEditing(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary min-h-[36px]"
            >
              <Edit3 size={14} />
              Edit
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocationEditing(false)}
              className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-medium text-text-muted min-h-[36px]"
            >
              Cancel
            </motion.button>
          )}
        </div>
        <p className="text-xs text-text-muted">Set your gym&apos;s GPS coordinates so the member app can verify check-ins via location.</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1">Latitude</label>
            <input
              type="number" step="any"
              defaultValue={config.gymLat ?? ""}
              id="gym-lat"
              disabled={!locationEditing}
              placeholder="e.g. 19.0760"
              className={`w-full rounded-lg px-3 py-2.5 text-sm placeholder-text-muted outline-none transition-colors ${
                locationEditing
                  ? "bg-white/[0.04] text-text-primary"
                  : "bg-white/[0.02] text-text-muted cursor-not-allowed"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Longitude</label>
            <input
              type="number" step="any"
              defaultValue={config.gymLng ?? ""}
              id="gym-lng"
              disabled={!locationEditing}
              placeholder="e.g. 72.8777"
              className={`w-full rounded-lg px-3 py-2.5 text-sm placeholder-text-muted outline-none transition-colors ${
                locationEditing
                  ? "bg-white/[0.04] text-text-primary"
                  : "bg-white/[0.02] text-text-muted cursor-not-allowed"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Radius (m)</label>
            <input
              type="number"
              defaultValue={config.gymRadius ?? ""}
              id="gym-radius"
              disabled={!locationEditing}
              placeholder="e.g. 100"
              className={`w-full rounded-lg px-3 py-2.5 text-sm placeholder-text-muted outline-none transition-colors ${
                locationEditing
                  ? "bg-white/[0.04] text-text-primary"
                  : "bg-white/[0.02] text-text-muted cursor-not-allowed"
              }`}
            />
          </div>
        </div>
        {locationEditing && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            disabled={locationStatus !== "idle"}
            onClick={async () => {
              const lat = parseFloat((document.getElementById("gym-lat") as HTMLInputElement).value);
              const lng = parseFloat((document.getElementById("gym-lng") as HTMLInputElement).value);
              const radius = parseFloat((document.getElementById("gym-radius") as HTMLInputElement).value);
              if (isNaN(lat) || isNaN(lng) || isNaN(radius)) return;
              setLocationStatus("saving");
              try {
                await updateGymLocation(lat, lng, radius);
                setLocationStatus("saved");
                setTimeout(() => {
                  setLocationStatus("idle");
                  setLocationEditing(false);
                }, 1500);
              } catch {
                setLocationStatus("idle");
              }
            }}
            className={`rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
              locationStatus === "saved"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            } disabled:opacity-60`}
          >
            <motion.span
              key={locationStatus}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5"
            >
              {locationStatus === "saving" && (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {locationStatus === "saved" && <Check size={14} />}
              {locationStatus === "saving" ? "Saving..." : locationStatus === "saved" ? "Saved" : "Save Location"}
            </motion.span>
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.2 }}
        className="glass-card rounded-xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <HardDrive size={16} />
            Backup &amp; Restore
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

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
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
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-all disabled:opacity-50 min-h-[44px]"
          >
            <Download size={16} />
            {backingUp ? "Exporting..." : "Export Backup"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileRef.current?.click()}
            disabled={restoring}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-text-muted hover:text-text-primary disabled:opacity-50 min-h-[44px]"
          >
            <Upload size={16} />
            {restoring ? "Restoring..." : "Restore Backup"}
          </motion.button>

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
      </motion.div>



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
