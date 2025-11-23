import { getBody } from '@/lib/getBody';
import prisma from '@/lib/prisma';

interface GenerateBody {
  custom_token?: string;
  expirate_date?: string; // dd-mm-yyyy or 'never'
  username: string;
}

function parseDateDDMMYYYY(s: string): Date | null {
  const parts = s.split('-');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (Number.isNaN(dd) || Number.isNaN(mm) || Number.isNaN(yyyy)) return null;
  // month is 1-based
  const d = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0));
  return isNaN(d.getTime()) ? null : d;
}

async function generateUniqueValue(preferred?: string) {
  if (preferred) {
    const exists = await prisma.token.findUnique({ where: { value: preferred } });
    if (!exists) return preferred;
    throw new Error('custom_token already exists');
  }

  // generate until unique (very unlikely to loop)
  for (let i = 0; i < 5; i++) {
    const v = (globalThis as any).crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    const exists = await prisma.token.findUnique({ where: { value: v } });
    if (!exists) return v;
  }
  throw new Error('failed to generate unique token');
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await getBody<GenerateBody>(request);
    const { custom_token, expirate_date, username } = body;

    if (!username || typeof username !== 'string') {
      return new Response(JSON.stringify({ error: 'username is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.findFirst({ where: { name: username } });
    if (!user) {
      return new Response(JSON.stringify({ error: 'user not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let expiresAt: Date | null = null;
    if (expirate_date && typeof expirate_date === 'string' && expirate_date.toLowerCase() !== 'never') {
      const parsed = parseDateDDMMYYYY(expirate_date);
      if (!parsed) return new Response(JSON.stringify({ error: 'invalid expirate_date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
      expiresAt = parsed;
    }

    const value = await generateUniqueValue(custom_token && String(custom_token).trim().length ? String(custom_token) : undefined);

    const token = await prisma.token.create({
      data: {
        value,
        user: { connect: { id: user.id } },
        expiresAt,
      },
    });

    return new Response(JSON.stringify({ token: token.value, expiresAt: token.expiresAt }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default null;
