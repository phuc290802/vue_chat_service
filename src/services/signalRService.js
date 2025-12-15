class SignalRService {
  constructor() {
    this.connection = null
    this.isConnected = false
    this.eventHandlers = new Map()
  }

  async connect(accessToken) {
    // Load SignalR library dynamically
    await this.loadSignalRLibrary()

    const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7113'
    
    this.connection = new window.signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub/chat`, {
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2, 5, 10, 30 seconds
          return Math.min(30000, [0, 2000, 5000, 10000, 30000][retryContext.previousRetryCount] || 30000)
        }
      })
      .build()

    this.setupConnectionEvents()
    
    await this.connection.start()
    this.isConnected = true
    
    return this.connection
  }

  async loadSignalRLibrary() {
    if (window.signalR) return

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/6.0.0/signalr.min.js'
      script.onload = () => {
        console.log('SignalR library loaded')
        resolve()
      }
      script.onerror = () => reject(new Error('Failed to load SignalR library'))
      document.head.appendChild(script)
    })
  }

  setupConnectionEvents() {
    this.connection.onreconnecting((error) => {
      console.log('WebSocket reconnecting:', error)
      this.isConnected = false
    })

    this.connection.onreconnected((connectionId) => {
      console.log('WebSocket reconnected:', connectionId)
      this.isConnected = true
    })

    this.connection.onclose((error) => {
      console.log('WebSocket closed:', error)
      this.isConnected = false
    })
  }

  async invoke(methodName, ...args) {
    if (!this.connection || !this.isConnected) {
      throw new Error('WebSocket not connected')
    }

    try {
      return await this.connection.invoke(methodName, ...args)
    } catch (error) {
      console.error(`WebSocket invoke ${methodName} failed:`, error)
      throw error
    }
  }

  on(methodName, callback) {
    if (this.connection) {
      this.connection.on(methodName, callback)
      
      // Store for cleanup
      if (!this.eventHandlers.has(methodName)) {
        this.eventHandlers.set(methodName, [])
      }
      this.eventHandlers.get(methodName).push(callback)
    }
  }

  off(methodName, callback) {
    if (this.connection) {
      this.connection.off(methodName, callback)
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        // Remove all event listeners
        this.eventHandlers.forEach((callbacks, methodName) => {
          callbacks.forEach(callback => {
            this.connection.off(methodName, callback)
          })
        })
        this.eventHandlers.clear()
        
        await this.connection.stop()
      } catch (error) {
        console.error('Error during disconnect:', error)
      } finally {
        this.connection = null
        this.isConnected = false
      }
    }
  }
}

export const signalRService = new SignalRService()