'use client';

import React from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-[#F7F6F2] border border-[#E8E5DF] rounded-sm max-w-lg w-full p-6 shadow-xl z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DF]">
          <h3 className="text-base font-bold text-[#171717] tracking-wide">
            Size & Fit Guide (Inches)
          </h3>
          <button onClick={onClose} className="p-1 text-[#77736C] hover:text-[#171717]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#77736C]">
          All IMAGIX oversized tees are tailored with a relaxed boxy drape and dropped shoulders. For a regular fit, consider sizing down.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D5D1C8] text-[#171717]">
                <th className="py-2 font-semibold">Size</th>
                <th className="py-2 font-semibold">Chest (in)</th>
                <th className="py-2 font-semibold">Length (in)</th>
                <th className="py-2 font-semibold">Shoulder (in)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DF] text-[#77736C]">
              <tr>
                <td className="py-2.5 font-medium text-[#171717]">S</td>
                <td className="py-2.5">40</td>
                <td className="py-2.5">27</td>
                <td className="py-2.5">19.5</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#171717]">M</td>
                <td className="py-2.5">42</td>
                <td className="py-2.5">28</td>
                <td className="py-2.5">20.5</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#171717]">L</td>
                <td className="py-2.5">44</td>
                <td className="py-2.5">29</td>
                <td className="py-2.5">21.5</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#171717]">XL</td>
                <td className="py-2.5">46</td>
                <td className="py-2.5">30</td>
                <td className="py-2.5">22.5</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-[#171717]">XXL</td>
                <td className="py-2.5">48</td>
                <td className="py-2.5">31</td>
                <td className="py-2.5">23.5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#EFECE6] p-3 text-[11px] text-[#77736C] rounded-sm space-y-1">
          <p className="font-semibold text-[#171717]">Measuring Tip:</p>
          <p>Measure across the fullest part of your chest, keeping the tape horizontal under your arms.</p>
        </div>
      </div>
    </div>
  );
}

