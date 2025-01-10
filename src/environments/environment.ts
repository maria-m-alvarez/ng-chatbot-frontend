export const environment = {
    production: true,
    apiBaseUrl: '/api',
    
    allowUserRegistration: false,
    allowSimulatedLogin: false,
    allowFileUpload: false,
    allowSidebar: false,

    simulateLogins: {
      'admin@minsait.com': { password: 'admin@minsait.com', role: 'admin' },
      'moderator@minsait.com': { password: 'moderator@minsait.com', role: 'moderator' },
      'user@minsait.com': { password: 'user@minsait.com', role: 'user' }
    } as Record<string, { password: string; role: string }>
};