// import fs from 'fs';
import { NextFunction, Request, Response as ExpressResponse } from 'express';
import { SpotifyRequest } from './SpotifyConfig';
import { Router } from 'express';
import base64 from 'base-64';
import https from 'https';
import queryString from 'query-string';
import { IncomingMessage } from 'http';

interface SpotifyTokenResponse extends ReadableStream {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

interface SpotifyOAuthResponse extends IncomingMessage {
  body: SpotifyTokenResponse;
}

const redirectToSpotify = (req: SpotifyRequest, res: ExpressResponse): void => {
  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${
      req.spotify.id
    }&response_type=code&redirect_uri=http://localhost${
      process.env.PORT ? ':' + process.env.PORT : ''
    }/login/callback`,
  );
};

const handleCallback = (
  req: Request,
  res: ExpressResponse,
  next: NextFunction,
): void => {
  const {
    query: { code, error },
  } = req;
  if (error) {
    res.send('Unauthorised');
    next();
  }
  getTokens(code)
    .then((response: SpotifyOAuthResponse) => {
      const { body } = response;
      res.send(body.access_token);
    })
    .catch(console.error);
};

const getTokens = (code: string): Promise<Object> => {
  const postdata: string = queryString.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: `http://localhost${
      process.env.PORT ? ':' + process.env.PORT : ''
    }/login/callback`,
  });

  return new Promise((resolve, reject) => {
    console.log('Requesting token from Spotify...');
    console.log(
      'Postdata',
      `Basic: ${base64.encode(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET,
      )}`,
    );
    https.request(
      {
        method: 'POST',
        protocol: 'https:',
        host: 'accounts.spotify.com',
        path: '/api/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postdata),
          Authorization: `Basic: ${base64.encode(
            process.env.SPOTIFY_CLIENT_ID +
              ':' +
              process.env.SPOTIFY_CLIENT_SECRET,
          )}`,
        },
      },
      (res: SpotifyOAuthResponse) => {
        if (res.statusCode !== 200) {
          reject({ code: res.statusCode, message: res.body });
          return;
        }
        res.on('error', reject);
        let data: string = '';
        res.on('data', chunk => {
          data = data + chunk;
          console.log(chunk);
        });
        res.on('finish', () => resolve(data));
      },
    );
  });
};

export default Router()
  .get('/', redirectToSpotify)
  .get('/callback', handleCallback);
