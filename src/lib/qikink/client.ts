export interface QikinkLineItem {
  search_from_my_products?: number; // 0 for sandbox base catalog, 1 for live dashboard mapped products
  sku: string;
  quantity: string | number;
  price: string | number;
  designs?: Array<{
    design_code: string;
    design_link?: string;
    placement: string;
    width?: number;
    height?: number;
  }>;
}

export interface QikinkShippingAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  phone: string;
  email: string;
  city: string;
  zip: string;
  province: string;
  country_code: string; // 'IN'
}

export interface QikinkCreateOrderPayload {
  order_number: string;
  qikink_shipping?: string; // "1"
  gateway?: 'Prepaid' | 'COD';
  total_order_value?: string;
  line_items: QikinkLineItem[];
  shipping_address: QikinkShippingAddress;
}

export interface QikinkOrderResponse {
  status: boolean;
  message?: string;
  order_id?: string;
  qikink_order_id?: string;
  errors?: any;
  [key: string]: any;
}

export class QikinkClient {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.QIKINK_CLIENT_ID || '';
    this.clientSecret = process.env.QIKINK_CLIENT_SECRET || '';
    let rawUrl = process.env.QIKINK_API_URL || 'https://sandbox.qikink.com';
    // Clean trailing slash and ensure correct base host
    rawUrl = rawUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    this.baseUrl = rawUrl;
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  /**
   * Retrieves a valid access token from Qikink API
   * POST /api/token (application/x-www-form-urlencoded)
   */
  public async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Qikink credentials (QIKINK_CLIENT_ID / QIKINK_CLIENT_SECRET) not configured on server');
    }

    // Return cached token if still valid (with 5 minute safety buffer)
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.cachedToken;
    }

    const params = new URLSearchParams();
    params.append('ClientId', this.clientId);
    params.append('client_secret', this.clientSecret);

    const res = await fetch(`${this.baseUrl}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Qikink token authentication failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const token = data.Accesstoken || data.access_token || data.token;

    if (!token) {
      throw new Error('Qikink did not return a valid Accesstoken');
    }

    this.cachedToken = token;
    // Default expiration to 1 hour if not specified
    const expiresInSeconds = Number(data.expires_in) || 3600;
    this.tokenExpiresAt = Date.now() + expiresInSeconds * 1000;

    return token;
  }

  /**
   * Submits a confirmed prepaid order to Qikink Open API
   * POST /api/order/create
   */
  public async createOrder(payload: QikinkCreateOrderPayload): Promise<QikinkOrderResponse> {
    const token = await this.getAccessToken();

    // Ensure strict payload formatting per Qikink guidelines:
    // 1. order_number max 15 chars
    const orderNumber = payload.order_number.slice(0, 15);
    const isSandbox = this.baseUrl.includes('sandbox');

    const formattedPayload = {
      order_number: orderNumber,
      qikink_shipping: payload.qikink_shipping || '1',
      gateway: payload.gateway || 'Prepaid',
      total_order_value: String(payload.total_order_value || '0'),
      line_items: payload.line_items.map((item) => ({
        search_from_my_products: item.search_from_my_products ?? (isSandbox ? 0 : 1),
        sku: item.sku,
        quantity: String(item.quantity),
        price: String(item.price),
        ...(item.designs ? { designs: item.designs } : {}),
      })),
      shipping_address: {
        first_name: payload.shipping_address.first_name,
        last_name: payload.shipping_address.last_name || payload.shipping_address.first_name,
        address1: payload.shipping_address.address1,
        address2: payload.shipping_address.address2 || '',
        phone: payload.shipping_address.phone,
        email: payload.shipping_address.email,
        city: payload.shipping_address.city,
        zip: payload.shipping_address.zip,
        province: payload.shipping_address.province,
        country_code: payload.shipping_address.country_code || 'IN',
      },
    };

    const res = await fetch(`${this.baseUrl}/api/order/create`, {
      method: 'POST',
      headers: {
        'ClientId': this.clientId,
        'Accesstoken': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedPayload),
    });

    const responseText = await res.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }

    if (!res.ok) {
      throw new Error(
        `Qikink order creation rejected (${res.status}): ${
          responseData?.message || responseData?.error || responseText.slice(0, 200)
        }`
      );
    }

    return responseData as QikinkOrderResponse;
  }

  /**
   * Fetches latest order status and tracking details from Qikink
   */
  public async getOrderStatus(qikinkOrderId: string): Promise<any> {
    const token = await this.getAccessToken();

    const res = await fetch(
      `${this.baseUrl}/api/order?id=${encodeURIComponent(qikinkOrderId)}`,
      {
        method: 'GET',
        headers: {
          'ClientId': this.clientId,
          'Accesstoken': token,
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch Qikink status (${res.status}): ${err.slice(0, 200)}`);
    }

    return await res.json();
  }
}

export const qikinkClient = new QikinkClient();
