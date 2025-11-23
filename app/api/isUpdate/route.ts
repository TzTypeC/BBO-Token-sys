export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const clientVersion = url.searchParams.get('Version');

    // Get current version from environment variable
    const currentVersion = process.env.VERSION || process.env.APP_VERSION || '2.0.0';

    // Check if version parameter is provided and not empty
    if (!clientVersion || clientVersion.trim() === '') {
      return new Response(JSON.stringify({ valid: false, message: 'Version parameter is required', code: '400' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normalize versions (remove leading/trailing whitespace, convert to lowercase for comparison)
    const normalizedClientVersion = clientVersion.trim().toLowerCase();
    const normalizedCurrentVersion = currentVersion.trim().toLowerCase();

    // Check if versions match
    if (normalizedClientVersion === normalizedCurrentVersion) {
      return new Response(JSON.stringify({ valid: true, message: 'version is up to date', code: '200', data: { currentVersion, clientVersion } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Versions don't match - update needed
    return new Response(JSON.stringify({ valid: false, message: 'update required', code: '426', data: { currentVersion, clientVersion } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ valid: false, message: String(err instanceof Error ? err.message : err), code: '500' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default null;

