import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';
import { CodeTradeRequest, RefreshTokenRequest } from './requests';
import { tradeCodeForToken, refreshToken } from './utils';

const prisma = new PrismaClient();
export default prisma;

const app = new Elysia()
    .post(
        '/oauth/twitch/code',
        async ({ body }) => {
            return await tradeCodeForToken(body as CodeTradeRequest);
        },
        {
            body: t.Object({
                authorization_code: t.String({
                    error: 'An autorization_code is required',
                }),
            }),
        }
    )
    .post(
        '/oauth/twitch/token',
        async ({ body }) => {
            return await refreshToken(body as RefreshTokenRequest);
        },
        {
            body: t.Object({
                expired_token: t.String({
                    error: 'An expired token is required',
                }),
            }),
        }
    )
    .post('/oauth/nightbot/token', () => 'Nightbot OAuth not implemented yet')
    .listen(8000);

console.log(
    `Flow API is running at ${app.server?.hostname}:${app.server?.port}`
);
