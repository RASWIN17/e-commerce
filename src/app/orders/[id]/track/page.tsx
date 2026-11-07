'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  ArrowLeft,
  FileText,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function OrderTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderNumber = resolvedParams.id;

  // Realistic timeline based on Qikink POD state machine
  const timelineSteps = [
    {
      title: 'Order Placed',
      description: 'Order details and variant snapshot registered.',
      date: 'Today, 03:15 PM',
      completed: true,
      current: false,
    },
    {
      title: 'Payment Confirmed',
      description: 'Cashfree transaction verified and authenticated.',
      date: 'Today, 03:16 PM',
      completed: true,
      current: false,
    },
    {
      title: 'Dispatched to Qikink Production',
      description: 'Artwork files routed to Tirupur DTG print facility.',
      date: 'Today, 03:18 PM',
      completed: true,
      current: true,
    },
    {
      title: 'Printing & Quality Control',
      description: '240 GSM organic blank pre-treated, printed, and cured.',
      date: 'Estimated tomorrow',
      completed: false,
      current: false,
    },
    {
      title: 'Dispatched & Courier Tracking',
      description: 'Handed over to Bluedart / Delhivery logistics.',
      date: 'Estimated in 2-3 days',
      completed: false,
      current: false,
    },
    {
      title: 'Out for Delivery',
      description: 'Courier agent arrives at your doorstep.',
      date: 'Estimated in 4-5 days',
      completed: false,
      current: false,
    },
    {
      title: 'Delivered',
      description: 'Package received by customer.',
      date: 'Expected arrival',
      completed: false,
      current: false,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs text-[#77736C] hover:text-[#171717]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Order Status Header */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E5DF] pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-sm">
              Confirmed & In Production
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#171717] mt-2">
              Order #{orderNumber}
            </h1>
            <p className="text-xs text-[#77736C] mt-1">
              Thank you for supporting sustainable print-on-demand craftsmanship.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert(`Tax invoice generated for ${orderNumber}. Downloading PDF...`)}
              className="inline-flex items-center gap-1.5 border border-[#D5D1C8] px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F6F2] rounded-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 border border-[#D5D1C8] px-3.5 py-2 text-xs font-medium text-[#171717] hover:bg-[#F7F6F2] rounded-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need Help?</span>
            </Link>
          </div>
        </div>

        {/* Courier & Partner info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div>
            <span className="text-[#77736C] block">Fulfilment Partner</span>
            <span className="font-semibold text-[#171717]">Qikink Open API Hub (Tirupur)</span>
          </div>
          <div>
            <span className="text-[#77736C] block">Carrier Logistics</span>
            <span className="font-semibold text-[#171717]">Delhivery / Bluedart Air</span>
          </div>
          <div>
            <span className="text-[#77736C] block">Estimated Arrival</span>
            <span className="font-semibold text-emerald-800">Within 3–5 Business Days</span>
          </div>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle space-y-6">
        <h2 className="text-base font-bold tracking-tight text-[#171717] uppercase tracking-wider">
          Fulfilment & Tracking Journey
        </h2>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E8E5DF]">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Dot icon */}
              <div
                className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  step.completed
                    ? 'bg-[#171717] text-white'
                    : step.current
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-[#E8E5DF] text-[#77736C]'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3
                    className={`text-xs font-semibold ${
                      step.current ? 'text-emerald-800' : 'text-[#171717]'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <span className="text-[11px] text-[#77736C]">{step.date}</span>
                </div>
                <p className="text-xs text-[#77736C] mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Notice */}
      <div className="bg-[#EFECE6] p-5 rounded-sm text-xs text-[#77736C] space-y-2">
        <p className="font-semibold text-[#171717]">Delivery Updates via SMS & Email</p>
        <p>
          You will receive automatic SMS updates directly from our courier partners once your package leaves our Tirupur facility with live GPS tracking links.
        </p>
      </div>
    </div>
  );
}

