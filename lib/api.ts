"use client"

// API client utilities for Sphira platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        // Silently handle API errors - don't log expected errors like "User address required"
        return {
          success: false,
          error: data.error || "API request failed",
        }
      }

      return data
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // SIP API methods
  async getSIPs(userAddress?: string) {
    const params = userAddress ? `?userAddress=${userAddress}` : ""
    return this.request(`/sips${params}`)
  }

  async createSIP(sipData: {
    name: string
    token: string
    amount: number
    frequency: string
    duration?: number
    penalty?: number
    reason?: string
  }) {
    return this.request("/sips", {
      method: "POST",
      body: JSON.stringify(sipData),
    })
  }

  async updateSIP(id: number, updates: { status?: string; amount?: number; frequency?: string }) {
    return this.request(`/sips/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteSIP(id: number) {
    return this.request(`/sips/${id}`, {
      method: "DELETE",
    })
  }

  // Yield API methods
  async getYieldPools(filters?: { token?: string; maxRisk?: number; sortBy?: string }) {
    const params = new URLSearchParams()
    if (filters?.token) params.append("token", filters.token)
    if (filters?.maxRisk) params.append("maxRisk", filters.maxRisk.toString())
    if (filters?.sortBy) params.append("sortBy", filters.sortBy)

    const queryString = params.toString()
    return this.request(`/yield/pools${queryString ? `?${queryString}` : ""}`)
  }

  // Portfolio API methods
  async getPortfolio(userAddress?: string) {
    const params = userAddress ? `?userAddress=${userAddress}` : ""
    return this.request(`/portfolio${params}`)
  }

  // Notifications API methods
  async getNotifications(options?: { unreadOnly?: boolean; limit?: number; userAddress?: string }) {
    const params = new URLSearchParams()
    if (options?.unreadOnly) params.append("unreadOnly", "true")
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.userAddress) params.append("userAddress", options.userAddress)

    const queryString = params.toString()
    return this.request(`/notifications${queryString ? `?${queryString}` : ""}`)
  }

  async createNotification(notification: {
    type: string
    title: string
    message: string
    priority?: string
    data?: any
  }) {
    return this.request("/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    })
  }

  async markNotificationAsRead(id: number) {
    return this.request(`/notifications/${id}/read`, {
      method: "PUT",
    })
  }

  // Chat API methods
  async sendChatMessage(message: string, userId?: string) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({ message, userId }),
    })
  }

  // Analytics API methods
  async getAnalytics(metric?: string, timeframe?: string) {
    const params = new URLSearchParams()
    if (metric) params.append("metric", metric)
    if (timeframe) params.append("timeframe", timeframe)

    const queryString = params.toString()
    return this.request(`/analytics${queryString ? `?${queryString}` : ""}`)
  }
}

export const apiClient = new ApiClient()

// React hooks for API calls
export function useApi() {
  return {
    sips: {
      list: (userAddress?: string) => apiClient.getSIPs(userAddress),
      create: (data: Parameters<typeof apiClient.createSIP>[0]) => apiClient.createSIP(data),
      update: (id: number, updates: Parameters<typeof apiClient.updateSIP>[1]) => apiClient.updateSIP(id, updates),
      delete: (id: number) => apiClient.deleteSIP(id),
    },
    yield: {
      pools: (filters?: Parameters<typeof apiClient.getYieldPools>[0]) => apiClient.getYieldPools(filters),
    },
    portfolio: {
      get: (userAddress?: string) => apiClient.getPortfolio(userAddress),
    },
    notifications: {
      list: (options?: Parameters<typeof apiClient.getNotifications>[0]) => apiClient.getNotifications(options),
      create: (data: Parameters<typeof apiClient.createNotification>[0]) => apiClient.createNotification(data),
      markRead: (id: number) => apiClient.markNotificationAsRead(id),
    },
    chat: {
      send: (message: string, userId?: string) => apiClient.sendChatMessage(message, userId),
    },
    analytics: {
      get: (metric?: string, timeframe?: string) => apiClient.getAnalytics(metric, timeframe),
    },
  }
}
