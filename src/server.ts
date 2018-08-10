import express, { Response } from 'express';
import {
  SpotifyAuthConfigMiddleware,
  SpotifyRequest,
} from './Handlers/SpotifyConfig';
const app = express();

import OAuth from './Handlers/OAuth';

// Spotify Config to each request
app.use(SpotifyAuthConfigMiddleware);

app.get('/', (_: SpotifyRequest, res: Response) => {
  res.json();
  // res.send('Partify is running');
});

app.use('/login', OAuth);

app.listen(process.env.PORT || 80, () => {
  console.log('Listening on ' + process.env.PORT || 80);
});
