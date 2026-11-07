'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { calculateDeliveryEstimate } from '../lib/delivery/calculator';
import { DeliveryEstimate } from '../lib/types';

interface PincodeCheckerProps {
  isAOP?: boolean;
  orderTotalPaise?: number;
  onEstimateChange?: (estimate: DeliveryEstimate) => void;
}

export default function PincodeChecker({
  isAOP = false,
  orderTotalPaise = 0,
  onEstimateChange,
}: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('');
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  // Load previously checked pincode
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem('imagix_pincode');
      if (savedPin && savedPin.length === 6) {
        setPincode(savedPin);
        const est = calculateDeliveryEstimate(savedPin, isAOP, orderTotalPaise);
        setEstimate(est);
        onEstimateChange?.(est);
      }
    } catch (e) {
      // ignore
    }
  }, [isAOP, orderTotalPaise]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pincode.trim().replace(/\D/g, '');
    if (clean.length !== 6) return;

    setLoading(true);
    setTimeout(() => {
      const est = calculateDeliveryEstimate(clean, isAOP, orderTotalPaise);
      setEstimate(est);
      try {
        localStorage.setItem('imagix_pincode', clean);
      } catch (err) {}
      onEstimateChange?.(est);
      setLoading(false);
    }, 200);
  };

  return (
    <div className="border border-[#E8E5DF] bg-[#FFFFFF] p-4 rounded-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#171717]">
        <Truck className="w-4 h-4 text-[#171717]" />
        <span>Estimated Delivery & Serviceability</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter 6-digit PIN code"
          className="flex-1 bg-[#F7F6F2] border border-[#D5D1C8] px-3 py-2 text-sm text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
        />
        <button
          type="submit"
          disabled={pincode.length !== 6 || loading}
          className="bg-[#171717] text-white px-4 py-2 text-xs font-medium uppercase tracking-wider hover:bg-[#2A2A2A] disabled:opacity-40 transition-colors rounded-sm"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {estimate && (
        <div className="text-xs space-y-2 pt-2 border-t border-[#E8E5DF]">
          {estimate.is_serviceable ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Serviceable for {estimate.city}, {estimate.state}</span>
              </div>
              <p className="text-[#171717]">
                Expected Delivery:{' '}
                <strong className="font-semibold text-black">
                  {estimate.estimated_delivery_start} – {estimate.estimated_delivery_end}
                </strong>
              </p>
              <div className="text-[#77736C] space-y-0.5">
                <p>• DTG Print & Tailoring: {estimate.production_days_min}–{estimate.production_days_max} business days</p>
                <p>• Express Transit: ~{estimate.courier_transit_days} days via Bluedart / Delhivery</p>
                <p className="font-medium text-[#171717]">
                  • Shipping Fee: {estimate.free_shipping_eligible ? 'FREE (Order ₹999+)' : '₹99 (Free on ₹999+)'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>PIN code currently not serviceable by our courier partners.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

