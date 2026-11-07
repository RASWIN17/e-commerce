import { describe, it, expect } from 'vitest';
import { calculateDeliveryEstimate } from '../lib/delivery/calculator';

describe('Delivery Estimation Calculator', () => {
  it('calculates express delivery correctly for metro Bangalore pincode', () => {
    const est = calculateDeliveryEstimate('560001', false, 120000); // ₹1200 order
    expect(est.is_serviceable).toBe(true);
    expect(est.city).toContain('Bengaluru');
    expect(est.free_shipping_eligible).toBe(true);
    expect(est.shipping_fee_paise).toBe(0);
    expect(est.total_days_min).toBeGreaterThan(0);
    expect(est.estimated_delivery_start).toBeTruthy();
    expect(est.estimated_delivery_end).toBeTruthy();
  });

  it('charges ₹99 delivery fee for orders below ₹999 threshold', () => {
    const est = calculateDeliveryEstimate('110001', false, 79900); // ₹799 order
    expect(est.is_serviceable).toBe(true);
    expect(est.free_shipping_eligible).toBe(false);
    expect(est.shipping_fee_paise).toBe(9900);
  });

  it('handles invalid pincode gracefully', () => {
    const est = calculateDeliveryEstimate('123', false, 50000);
    expect(est.is_serviceable).toBe(false);
    expect(est.notes).toContain('valid 6-digit');
  });
});

