'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [resolving, setResolving] = useState(false);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('grievance_complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setGrievances(data);
      }
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      setResolving(true);
      const supabase = createClient();
      const resSummary = resolutionText.trim() || 'Grievance redressed in compliance with Consumer Protection Rules.';

      const { error } = await supabase
        .from('grievance_complaints')
        .update({
          status: 'resolved',
          resolution_summary: resSummary,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setGrievances((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                status: 'resolved',
                resolution_summary: resSummary,
                resolved_at: new Date().toISOString(),
              }
            : g
        )
      );
      setSelectedGrievance(null);
      setResolutionText('');
    } catch (err: any) {
      alert(err.message || 'Failed to update grievance');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#77736C] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin text-[#171717] mx-auto" />
        <p>Loading statutory consumer grievance records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E8E5DF] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Consumer Grievance Redressal Desk
        </h1>
        <p className="text-xs text-[#77736C] mt-1">
          Statutory officer dashboard under Rule 5(4) of the Consumer Protection (E-Commerce) Rules.
        </p>
      </div>

      <div className="bg-white border border-[#E8E5DF] rounded-sm shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8E5DF] text-[#77736C] bg-[#F7F6F2]">
                <th className="py-3 px-4 font-medium">Ticket Ref</th>
                <th className="py-3 px-4 font-medium">Complainant</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Submitted</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF] text-[#171717]">
              {grievances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#77736C]">
                    No grievance complaints logged in the system.
                  </td>
                </tr>
              ) : (
                grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F7F6F2]">
                    <td className="py-3 px-4 font-mono font-bold text-[#171717]">{g.complaint_reference}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold block">{g.complainant_name}</span>
                      <span className="text-[11px] text-[#77736C]">{g.email} • {g.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-[#77736C]">{g.category}</td>
                    <td className="py-3 px-4 text-[#77736C]">
                      {new Date(g.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                          g.status === 'resolved'
                            ? 'text-emerald-800 bg-emerald-50'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {g.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedGrievance(g)}
                        className="bg-[#171717] text-white px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-[#2A2A2A]"
                      >
                        View & Redress
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#F7F6F2] border border-[#E8E5DF] p-6 rounded-sm max-w-lg w-full space-y-4">
            <h2 className="text-base font-bold text-[#171717]">
              Resolve Grievance: {selectedGrievance.complaint_reference}
            </h2>
            <div className="bg-white p-4 border border-[#D5D1C8] rounded-sm text-xs space-y-2">
              <p><strong>Complainant:</strong> {selectedGrievance.complainant_name} ({selectedGrievance.email})</p>
              <p><strong>Phone:</strong> {selectedGrievance.phone}</p>
              <p><strong>Category:</strong> {selectedGrievance.category}</p>
              <p><strong>Complaint:</strong> {selectedGrievance.description}</p>
              {selectedGrievance.resolution_summary && (
                <p className="text-emerald-800 font-medium pt-1">
                  <strong>Previous Resolution:</strong> {selectedGrievance.resolution_summary}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Official Resolution Summary
              </label>
              <textarea
                rows={4}
                required
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Enter actions taken (e.g. Free replacement dispatched / Full refund processed)..."
                className="w-full p-2.5 bg-white border border-[#D5D1C8] rounded-sm text-xs text-[#171717]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedGrievance(null)}
                className="px-4 py-2 border border-[#D5D1C8] rounded-sm text-xs text-[#77736C]"
              >
                Close
              </button>
              <button
                disabled={resolving}
                onClick={() => handleResolve(selectedGrievance.id)}
                className="px-5 py-2 bg-emerald-800 text-white rounded-sm text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
              >
                {resolving ? 'Saving...' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
