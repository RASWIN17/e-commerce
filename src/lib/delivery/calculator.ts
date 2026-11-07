import { DeliveryEstimate } from '../types';

interface PincodeData {
  city: string;
  state: string;
  transitDays: number;
  isServiceable: boolean;
}

// Prefix-based geographic routing for India PIN codes (110xxx - 85xxxx)
const PINCODE_PREFIX_MAP: Record<string, PincodeData> = {
  // Delhi NCR
  '11': { city: 'New Delhi', state: 'Delhi', transitDays: 2, isServiceable: true },
  '12': { city: 'Gurugram / Faridabad', state: 'Haryana', transitDays: 2, isServiceable: true },
  '20': { city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', transitDays: 2, isServiceable: true },
  // Mumbai & Maharashtra
  '40': { city: 'Mumbai', state: 'Maharashtra', transitDays: 2, isServiceable: true },
  '41': { city: 'Pune', state: 'Maharashtra', transitDays: 2, isServiceable: true },
  '42': { city: 'Nashik / Thane', state: 'Maharashtra', transitDays: 3, isServiceable: true },
  '44': { city: 'Nagpur', state: 'Maharashtra', transitDays: 3, isServiceable: true },
  // Bengaluru & Karnataka
  '56': { city: 'Bengaluru', state: 'Karnataka', transitDays: 2, isServiceable: true },
  '57': { city: 'Mangaluru', state: 'Karnataka', transitDays: 3, isServiceable: true },
  '58': { city: 'Hubballi / Belagavi', state: 'Karnataka', transitDays: 3, isServiceable: true },
  // Chennai & Tamil Nadu (Qikink hub is in Tirupur/Tamil Nadu!)
  '60': { city: 'Chennai', state: 'Tamil Nadu', transitDays: 1, isServiceable: true },
  '64': { city: 'Coimbatore / Tirupur', state: 'Tamil Nadu', transitDays: 1, isServiceable: true },
  '62': { city: 'Madurai', state: 'Tamil Nadu', transitDays: 2, isServiceable: true },
  '63': { city: 'Salem / Erode', state: 'Tamil Nadu', transitDays: 2, isServiceable: true },
  // Hyderabad & Telangana
  '50': { city: 'Hyderabad', state: 'Telangana', transitDays: 2, isServiceable: true },
  '51': { city: 'Warangal / Nizamabad', state: 'Telangana', transitDays: 3, isServiceable: true },
  // Kolkata & West Bengal
  '70': { city: 'Kolkata', state: 'West Bengal', transitDays: 3, isServiceable: true },
  '71': { city: 'Howrah', state: 'West Bengal', transitDays: 3, isServiceable: true },
  // Gujarat
  '38': { city: 'Ahmedabad', state: 'Gujarat', transitDays: 2, isServiceable: true },
  '39': { city: 'Surat / Vadodara', state: 'Gujarat', transitDays: 2, isServiceable: true },
  // Kerala
  '68': { city: 'Kochi / Ernakulam', state: 'Kerala', transitDays: 2, isServiceable: true },
  '69': { city: 'Thiruvananthapuram', state: 'Kerala', transitDays: 2, isServiceable: true },
  // Rajasthan
  '30': { city: 'Jaipur', state: 'Rajasthan', transitDays: 3, isServiceable: true },
  '34': { city: 'Jodhpur', state: 'Rajasthan', transitDays: 3, isServiceable: true },
  // Punjab & Chandigarh
  '14': { city: 'Amritsar / Jalandhar', state: 'Punjab', transitDays: 3, isServiceable: true },
  '16': { city: 'Chandigarh', state: 'Punjab', transitDays: 2, isServiceable: true },
  // MP & Central
  '45': { city: 'Indore', state: 'Madhya Pradesh', transitDays: 3, isServiceable: true },
  '46': { city: 'Bhopal', state: 'Madhya Pradesh', transitDays: 3, isServiceable: true },
  // Northeast & Remote
  '78': { city: 'Guwahati', state: 'Assam', transitDays: 5, isServiceable: true },
  '79': { city: 'Imphal / Shillong', state: 'North East', transitDays: 6, isServiceable: true },
  '19': { city: 'Srinagar', state: 'Jammu & Kashmir', transitDays: 5, isServiceable: true },
  '74': { city: 'Port Blair', state: 'Andaman & Nicobar', transitDays: 7, isServiceable: true },
};

function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    // Exclude Sundays
    if (dayOfWeek !== 0) {
      added++;
    }
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateDeliveryEstimate(
  pincode: string,
  isAOP: boolean = false,
  orderTotalPaise: number = 0
): DeliveryEstimate {
  const cleanPin = pincode.trim().replace(/\D/g, '');

  if (cleanPin.length !== 6) {
    return {
      pincode: cleanPin,
      is_serviceable: false,
      city: 'Unknown',
      state: 'Unknown',
      production_days_min: 0,
      production_days_max: 0,
      courier_transit_days: 0,
      total_days_min: 0,
      total_days_max: 0,
      estimated_delivery_start: '',
      estimated_delivery_end: '',
      shipping_fee_paise: 9900,
      free_shipping_eligible: false,
      notes: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  const prefix = cleanPin.slice(0, 2);
  const location = PINCODE_PREFIX_MAP[prefix] || {
    city: 'India Hub',
    state: 'Rest of India',
    transitDays: 4,
    isServiceable: true,
  };

  // Qikink dispatch windows: Standard DTG (2-3 business days), AOP (4-5 business days)
  const productionMin = isAOP ? 4 : 2;
  const productionMax = isAOP ? 5 : 3;
  const transitDays = location.transitDays;

  const totalMin = productionMin + transitDays;
  const totalMax = productionMax + transitDays;

  const today = new Date();
  const startDate = addBusinessDays(today, totalMin);
  const endDate = addBusinessDays(today, totalMax);

  // Free shipping above ₹999 (99900 paise)
  const isFreeShipping = orderTotalPaise >= 99900;
  const shippingFeePaise = isFreeShipping ? 0 : 9900;

  return {
    pincode: cleanPin,
    is_serviceable: location.isServiceable,
    city: location.city,
    state: location.state,
    production_days_min: productionMin,
    production_days_max: productionMax,
    courier_transit_days: transitDays,
    total_days_min: totalMin,
    total_days_max: totalMax,
    estimated_delivery_start: formatDate(startDate),
    estimated_delivery_end: formatDate(endDate),
    shipping_fee_paise: shippingFeePaise,
    free_shipping_eligible: isFreeShipping,
    notes: `Estimated ${productionMin}–${productionMax} days for print production in Tirupur + ${transitDays} days express transit to ${location.city}.`,
  };
}

