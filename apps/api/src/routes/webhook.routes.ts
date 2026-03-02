import type { Router as RouterType } from 'express';
import { Router } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../config/db';

export const webhookRoutes: RouterType = Router();

webhookRoutes.post('/auth/webhook', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let event: Record<string, unknown>;

  try {
    event = wh.verify(JSON.stringify(req.body), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as Record<string, unknown>;
  } catch (err) {
    console.error('❌ Webhook verification failed:', err);
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Verification failed' });
  }

  if (event.type === 'user.created' || event.type === 'user.updated') {
    const data = event.data as Record<string, unknown>;
    const id = data.id as string;
    const email_addresses = data.email_addresses as Array<{ email_address: string }>;
    const first_name = data.first_name as string | null;
    const last_name = data.last_name as string | null;
    const email = email_addresses?.[0]?.email_address ?? `${id}@placeholder.local`;
    const name = [first_name, last_name].filter(Boolean).join(' ') || null;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: { email, name },
      create: { clerkId: id, email, name },
    });
  }

  res.json({ received: true });
});
