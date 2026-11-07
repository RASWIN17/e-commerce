'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState([
    {
      id: 'grv-1',
      ref: 'GRV-2026-849102',
      name: 'Aditya Nair',
      email: 'aditya.n@gmail.com',
      phone: '9845012345',
      category: 'Damaged / Defective Print or Garment',
      description: 'Minor collar stitch issue on Sunset Graphic Tee Size M.',
      status: 'acknowledged',
      submittedAt: 'Today, 11:30 AM',
      acknowledgedAt: 'Today, 12:15 PM',
      resolutionNotes: 'Approved free doorstep replacement. Re-print job scheduled via Qikink.',
    },
  ]);

  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [resolutionText, setResolutionText] = useState('');

  const handleResolve = (id: string) => {
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: 'resolved',
              resolutionNotes: resolutionText || 'Grievance resolved in accordance with Consumer Protection Rules.',
            }
          : g
      )
    );
    setSelectedGrievance(null);
    setResolutionText('');
  };

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
              {grievances.map((g) => (
                <tr key={g.id} className="hover:bg-[#F7F6F2]">
                  <td className="py-3 px-4 font-mono font-bold text-[#171717]">{g.ref}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold block">{g.name}</span>
                    <span className="text-[11px] text-[#77736C]">{g.email} • {g.phone}</span>
                  </td>
                  <td className="py-3 px-4 text-[#77736C]">{g.category}</td>
                  <td className="py-3 px-4 text-[#77736C]">{g.submittedAt}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-[#F7F6F2] border border-[#E8E5DF] p-6 rounded-sm max-w-lg w-full space-y-4">
            <h2 className="text-base font-bold text-[#171717]">
              Resolve Grievance: {selectedGrievance.ref}
            </h2>
            <div className="bg-white p-4 border border-[#D5D1C8] rounded-sm text-xs space-y-2">
              <p><strong>Complainant:</strong> {selectedGrievance.name} ({selectedGrievance.email})</p>
              <p><strong>Issue:</strong> {selectedGrievance.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Official Resolution Summary (Sent to Complainant)
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
                onClick={() => handleResolve(selectedGrievance.id)}
                className="px-5 py-2 bg-emerald-800 text-white rounded-sm text-xs font-semibold uppercase tracking-wider"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

