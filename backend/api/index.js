// Vercel function entry. Every request is rewritten here (see vercel.json) and
// handed to the Nest app built into dist/ by `npm run build:deploy`.
import { getHandler } from '../dist/serverless.js';

export default async function handler(req, res) {
  const app = await getHandler();
  return app(req, res);
}
