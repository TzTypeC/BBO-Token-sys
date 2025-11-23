import prisma from '@/lib/prisma';

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const tokenValue = url.searchParams.get('token');
    const deviceId = url.searchParams.get('deviceId');

    if (!tokenValue) return new Response(JSON.stringify({ valid: false, reason: 'missing token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

    const token = await prisma.token.findUnique({ where: { value: tokenValue } });
    if (!token) return new Response(JSON.stringify({ valid: false, reason: 'not found' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    // check expiry
    if (token.expiresAt && new Date() > token.expiresAt) {
      return new Response(JSON.stringify({ valid: false, reason: 'expired' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle deviceId logic and update lastUsed
    const now = new Date();
    
    if (deviceId) {
      // If token has no deviceId, set it (first use)
      if (!token.deviceId) {
        const updatedToken = await prisma.token.update({
          where: { value: tokenValue },
          data: { deviceId, lastUsed: now },
        });
        return new Response(JSON.stringify({ valid: true, token: updatedToken.value, userId: updatedToken.userId, expiresAt: updatedToken.expiresAt }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // If token already has a deviceId and it's different, return conflict
      if (token.deviceId !== deviceId) {
        return new Response(JSON.stringify({ valid: false, message: 'Token ini sudah di gunakan di perangkat lain', code: 409 }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Same deviceId - update lastUsed
      const updatedToken = await prisma.token.update({
        where: { value: tokenValue },
        data: { lastUsed: now },
      });
      return new Response(JSON.stringify({ valid: true, token: updatedToken.value, userId: updatedToken.userId, expiresAt: updatedToken.expiresAt }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // No deviceId provided - update lastUsed
    const updatedToken = await prisma.token.update({
      where: { value: tokenValue },
      data: { lastUsed: now },
    });
    return new Response(JSON.stringify({ valid: true, token: updatedToken.value, userId: updatedToken.userId, expiresAt: updatedToken.expiresAt }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ valid: false, error: String(err instanceof Error ? err.message : err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default null;
