// Vercel function entry. Every request is rewritten here (see vercel.json) and
// handed to the Nest app built into dist/ by `npm run build:deploy`.
//
// dist/ is imported lazily so a boot failure (most often a missing environment
// variable: the app refuses to start without JWT_SECRET, DATABASE_URL and, in
// production, CORS_ORIGINS) is logged in full and answered with a readable
// error, instead of crashing the invocation as an opaque FUNCTION_INVOCATION_FAILED.
let loading;

function load() {
  loading ??= import('../dist/serverless.js').then((m) => m.getHandler());
  return loading;
}

export default async function handler(req, res) {
  try {
    const app = await load();
    return app(req, res);
  } catch (error) {
    loading = undefined;
    console.error('API failed to start:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        statusCode: 500,
        message: 'API failed to start. Check the function logs and environment variables.',
      }),
    );
  }
}
