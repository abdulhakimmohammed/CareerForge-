/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { JobApplication } from "../types";
import { Briefcase, Calendar, DollarSign, Plus, Trash, ArrowRight, ClipboardList, PenTool, CheckCircle, HelpCircle } from "lucide-react";

interface JobTrackerProps {
  applications: JobApplication[];
  onAddApplication: (app: JobApplication) => void;
  onUpdateApplication: (app: JobApplication) => void;
  onRemoveApplication: (id: string) => void;
}

const STAGES = [
  { id: "wishlist", label: "Wishlist", color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300" },
  { id: "applied", label: "Applied", color: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-300" },
  { id: "assessment", label: "Assessment", color: "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-300" },
  { id: "interview", label: "Interviews", color: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-300" },
  { id: "offer", label: "Offers", color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-300" },
  { id: "rejected", label: "Rejected", color: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-300" },
] as const;

export default function JobTracker({
  applications,
  onAddApplication,
  onUpdateApplication,
  onRemoveApplication,
}: JobTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form states
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<JobApplication["status"]>("applied");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !position) return;

    if (editingApp) {
      const updated: JobApplication = {
        ...editingApp,
        company,
        position,
        salary,
        deadline,
        status,
        notes,
        updatedAt: new Date().toLocaleDateString(),
      };
      onUpdateApplication(updated);
      setEditingApp(null);
    } else {
      const newApp: JobApplication = {
        id: Math.random().toString(36).substr(2, 9),
        company,
        position,
        salary,
        deadline,
        status,
        notes,
        updatedAt: new Date().toLocaleDateString(),
      };
      onAddApplication(newApp);
      setShowAddForm(false);
    }

    // Reset Form
    setCompany("");
    setPosition("");
    setSalary("");
    setDeadline("");
    setStatus("applied");
    setNotes("");
  };

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app);
    setCompany(app.company);
    setPosition(app.position);
    setSalary(app.salary);
    setDeadline(app.deadline);
    setStatus(app.status);
    setNotes(app.notes);
    setShowAddForm(true);
  };

  const handleMoveStage = (app: JobApplication, direction: "next" | "prev") => {
    const stageIds = STAGES.map((s) => s.id);
    const currentIndex = stageIds.indexOf(app.status);
    let nextIndex = currentIndex;

    if (direction === "next" && currentIndex < stageIds.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === "prev" && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex !== currentIndex) {
      onUpdateApplication({
        ...app,
        status: stageIds[nextIndex] as JobApplication["status"],
        updatedAt: new Date().toLocaleDateString(),
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-left" id="job-tracker">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white font-display flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-indigo-500" />
            <span>Job Application Tracker</span>
          </h2>
          <p className="text-xs text-slate-500">Log application states, salary, and notes to stay on top of the interviewing pipeline.</p>
        </div>

        <button
          onClick={() => {
            setEditingApp(null);
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1 shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Job Stage</span>
        </button>
      </div>

      {/* Slide down Add / Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 bg-slate-50/20 text-left">
          <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider block">
            {editingApp ? "Edit Job Entry Details" : "Create New Job Tracking Card"}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, OpenAI"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role / Position</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior Frontend Architect"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pipeline Stage</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Salary Range / Value</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $140,000 - $160,000"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Next Action Deadline</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. July 12th, 2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Short Pipeline notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Recruiter call done, waiting on technical screen"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingApp(null);
              }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow"
            >
              {editingApp ? "Save Changes" : "Log Application Card"}
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const appsInStage = applications.filter((app) => app.status === stage.id);
          return (
            <div key={stage.id} className="flex flex-col space-y-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl min-h-[350px]">
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{appsInStage.length}</span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                {appsInStage.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <span className="text-[10px] text-slate-400 italic">Drag/Add card</span>
                  </div>
                ) : (
                  appsInStage.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl shadow-xs hover:shadow-sm hover:border-indigo-500/10 transition-all text-left space-y-2.5 group relative"
                    >
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{app.position}</h4>
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{app.company}</p>
                      </div>

                      {/* Card Meta lines */}
                      {(app.salary || app.deadline) && (
                        <div className="space-y-1 pt-1.5 border-t border-slate-50 dark:border-slate-900 text-[9px] text-slate-500 font-mono">
                          {app.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{app.salary}</span>
                            </div>
                          )}
                          {app.deadline && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{app.deadline}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-[9px] text-slate-400 line-clamp-2 bg-slate-50 p-1.5 rounded dark:bg-slate-900/40">
                          {app.notes}
                        </p>
                      )}

                      {/* Quick Move and edit panel */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-900">
                        <div className="flex items-center gap-1 text-[9px]">
                          <button
                            onClick={() => handleMoveStage(app, "prev")}
                            disabled={app.status === "wishlist"}
                            className="px-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                            title="Move back"
                          >
                            ←
                          </button>
                          <span className="font-semibold text-slate-400">Move</span>
                          <button
                            onClick={() => handleMoveStage(app, "next")}
                            disabled={app.status === "rejected"}
                            className="px-1 text-slate-400 hover:text-slate-800 disabled:opacity-30"
                            title="Move forward"
                          >
                            →
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(app)}
                            className="text-[9px] font-bold text-slate-400 hover:text-indigo-600"
                            title="Edit entry"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onRemoveApplication(app.id)}
                            className="text-[9px] text-red-400 hover:text-red-600 font-bold"
                            title="Delete card"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
