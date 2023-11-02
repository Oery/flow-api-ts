export interface CodeTradeRequest {
    authorization_code: string;
}

export interface RefreshTokenRequest {
    expired_token: string;
}
