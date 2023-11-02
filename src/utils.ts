import { CodeTradeRequest, RefreshTokenRequest } from './requests';
import axios from 'axios';
import prisma from '.';

export async function tradeCodeForToken(body: CodeTradeRequest) {
    const code = body.authorization_code;
    console.log(`Received Code : ${code}`);

    const params = {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:8457',
    };

    try {
        const url = 'https://id.twitch.tv/oauth2/token';
        const response = await axios.post(url, params);

        await prisma.twitch.create({
            data: {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
            },
        });
        console.log('Record created');
        return { token: response.data.access_token };
    } catch (error: any) {
        const errorMessage = error.response
            ? error.response.data.message
            : error.message;
        throw Error(errorMessage);
    }
}

export async function refreshToken(body: RefreshTokenRequest) {
    const expiredToken = body.expired_token;
    const user = await prisma.twitch.findUnique({
        where: {
            access_token: expiredToken,
        },
    });

    if (!user) throw Error('User was not found');

    const params = {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: user.refresh_token,
    };

    try {
        const url = 'https://id.twitch.tv/oauth2/token';
        const response = await axios.post(url, params);

        await prisma.twitch.update({
            where: { refresh_token: user.refresh_token },
            data: { access_token: response.data.access_token },
        });

        return { token: response.data.access_token };
    } catch (error: any) {
        const errorMessage = error.response
            ? error.response.data.message
            : error.message;
        throw Error(errorMessage);
    }
}
