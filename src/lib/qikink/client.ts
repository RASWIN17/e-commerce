export interface QikinkOrderItem {
  search_type: string; // 'sku'
  query: string; // Qikink variant SKU (e.g. QIK-OVTEE-BLK-M)
  quantity: number;
  print_type?: string; // 'DTG'
  designs?: Array<{
    design_code: string;
    design_link?: string; // High-res artwork URL (accessible to Qikink)
    placement: string; // 'front', 'back', 'left_chest', 'right_chest'
    width?: number; // in inches
    height?: number;
  }>;
}

export interface QikinkCreateOrderPayload {
  order_number: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  country: string;
  shipping_type: string; // 'Surface' or 'Express'
  payment_type: 'Prepaid' | 'COD';
  line_items: QikinkOrderItem[];
}

export interface QikinkOrderResponse {
  status: boolean;
  message: string;
  order_id?: string;
  qikink_order_id?: string;
  errors?: any;
}

export class QikinkClient {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.QIKINK_CLIENT_ID || '';
    this.clientSecret = process.env.QIKINK_CLIENT_SECRET || '';
    this.baseUrl = process.env.QIKINK_API_URL || 'https://admins.qikink.com/api';
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Submits a confirmed order to Qikink Open API
   */
  public async createOrder(payload: QikinkCreateOrderPayload): Promise<QikinkOrderResponse> {
    if (!this.isConfigured()) {
      // Return a realistic simulation response in development mode
      return {
        status: true,
        message: 'Order simulated successfully in IMAGIX staging',
        qikink_order_id: `QK-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      };
    }

    const res = await fetch(`${this.baseUrl}/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ClientId': this.clientId,
        'client_secret': this.clientSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Qikink API error (${res.status}): ${errText}`);
    }

    return (await res.json()) as QikinkOrderResponse;
  }

  /**
   * Fetches latest order status and tracking details from Qikink
   */
  public async getOrderStatus(qikinkOrderId: string): Promise<any> {
    if (!this.isConfigured()) {
      return {
        status: true,
        qikink_order_id: qikinkOrderId,
        order_status: 'Printing in progress',
        courier_name: 'Delhivery',
        tracking_number: `DL${Date.now().toString().slice(-8)}IN`,
        tracking_url: `https://www.delhivery.com/track/package/DL${Date.now().toString().slice(-8)}IN`,
      };
    }

    const res = await fetch(`${this.baseUrl}/order/status?order_id=${encodeURIComponent(qikinkOrderId)}`, {
      method: 'GET',
      headers: {
        'ClientId': this.clientId,
        'client_secret': this.clientSecret,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch Qikink status: ${err}`);
    }

    return await res.json();
  }
}

export const qikinkClient = new QikinkClient();

