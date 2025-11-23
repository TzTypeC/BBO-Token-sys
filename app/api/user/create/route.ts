import prisma from '@/lib/prisma';
import { getBody } from '@/lib/getBody';

interface CreateUserBody {
  username?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await getBody<CreateUserBody>(request);
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return new Response(JSON.stringify({ error: 'username is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // `name` is not unique in the schema; we store username in the `name` column
    const existing = await prisma.user.findFirst({ where: { name: username } });

    if (existing) {
      return new Response(JSON.stringify({ error: 'username already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await prisma.user.create({ data: { name: username } });

    return new Response(
      JSON.stringify({ id: user.id, username: user.name, createdAt: user.createdAt }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error', detail: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
