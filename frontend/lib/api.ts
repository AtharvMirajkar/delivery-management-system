const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'admin' | 'partner';
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  pickupLocation: { lat: number; lng: number };
  deliveryAddress: string;
  deliveryLocation: { lat: number; lng: number };
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isAvailable: boolean;
}

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(credentials: LoginCredentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async register(data: RegisterData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async getOrders(): Promise<{ orders: Order[] }> {
    const response = await fetch(`${API_URL}/orders`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }

  async createOrder(orderData: Partial<Order>) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return response.json();
  }

  async assignOrder(orderId: string, partnerId: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ partnerId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign order');
    }

    return response.json();
  }

  async updateOrderStatus(orderId: string, status: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update order status');
    }

    return response.json();
  }

  async deleteOrder(orderId: string) {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete order');
    }

    return response.json();
  }

  async getPartners(): Promise<{ partners: Partner[] }> {
    const response = await fetch(`${API_URL}/partners`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch partners');
    }

    return response.json();
  }

  async getAvailablePartners(): Promise<{ partners: Partner[] }> {
    const response = await fetch(`${API_URL}/partners/available`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available partners');
    }

    return response.json();
  }

  async updateAvailability(isAvailable: boolean) {
    const response = await fetch(`${API_URL}/partners/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ isAvailable }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update availability');
    }

    return response.json();
  }
}

export const api = new ApiService();
