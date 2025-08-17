const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  // Helper method to set auth token
  setAuthToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Helper method to remove auth token
  removeAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    console.log('API Request Details:', {
      url: `${this.baseURL}${endpoint}`,
      method: options.method || 'GET',
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'None'
    });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      console.log('API Response Details:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: response.url
        });
        throw new Error(errorData.error || `HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async register(email, password) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.removeAuthToken();
  }

  // Track endpoints
  async getMyTracks() {
    return await this.request('/tracks/my-tracks');
  }

  async getTrack(id) {
    return await this.request(`/tracks/${id}`);
  }

  async uploadTrack(formData) {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseURL}/tracks/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteTrack(id) {
    return await this.request(`/tracks/${id}`, {
      method: 'DELETE',
    });
  }

  // Custom tag endpoints
  async addCustomTag(trackId, tags) {
    return await this.request(`/tracks/${trackId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  // Training endpoints
  async trainPersonalModel() {
    return await this.request('/tracks/train-personal-model', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;
export { ApiService };