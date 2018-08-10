import { Request, Response, NextFunction } from 'express';

type Spotify = 'id' | 'secret' | 'callback';

export interface SpotifyRequest extends Request {
  spotify: Record<Spotify, string | undefined>;
}

const spotify = {
  id: process.env.SPOTIFY_CLIENT_ID,
  secret: process.env.SPOTIFY_CLIENT_SECRET,
  callback: process.env.SPOTIFY_AUTH_CALLBACK,
};

export default spotify;

export const SpotifyAuthConfigMiddleware = (
  req: SpotifyRequest,
  _: Response,
  next: NextFunction,
): void => {
  req.spotify = spotify;
  next();
};
