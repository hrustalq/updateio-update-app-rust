export interface QRCodeSession {
  qrCode: string
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'NOT_FOUND'
}

export interface QRCodeGenerateResponse {
  code: string
  expiresAt: string
}

export interface QRCodeLoginData {
  code: string
}

export interface QRCodeLoginResponse {
  // The response will be empty as it sets cookies directly
}

// For refresh token endpoint
export interface RefreshTokenResponse {
  // The response will be empty as it sets cookies directly
}