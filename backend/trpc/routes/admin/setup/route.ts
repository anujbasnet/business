import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '../../../create-context';
import { supabaseAdmin } from '@/backend/lib/supabase-admin';

const BUCKETS = [
  { id: 'business-images', public: true },
  { id: 'portfolio-images', public: true },
  { id: 'user-avatars', public: true },
] as const;

async function ensureBuckets() {
  for (const b of BUCKETS) {
    try {
      console.log('[setup] Ensuring bucket', b.id);
      const { data: existing, error: listErr } = await supabaseAdmin.storage.listBuckets();
      if (listErr) throw listErr;
      const found = existing?.some((bk) => bk.id === b.id) ?? false;
      if (!found) {
        const { error } = await supabaseAdmin.storage.createBucket(b.id, {
          public: b.public,
        });
        if (error) throw error;
      }
    } catch (e) {
      console.error('[setup] ensureBuckets error', e);
      throw e as Error;
    }
  }
}

async function tableExists(table: string) {
  try {
    const { error } = await supabaseAdmin.from(table as never).select('count').limit(1);
    if (error) {
      console.warn(`[setup] tableExists(${table}) error`, error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[setup] tableExists exception', e);
    return false;
  }
}

async function ensureMockData() {
  console.log('[setup] Seeding mock data');

  const haveUsers = await tableExists('users');
  const haveBusinesses = await tableExists('businesses');
  const haveServices = await tableExists('services');
  const haveClients = await tableExists('clients');

  if (!haveUsers || !haveBusinesses || !haveServices || !haveClients) {
    return {
      status: 'missing_schema' as const,
      message:
        'Some tables are missing. Open Supabase SQL editor and run database/supabase-setup.sql from the repo, then rerun this setup.',
    };
  }

  const ownerEmail = 'owner@example.com';
  const customerEmail = 'customer@example.com';

  const ensureUser = async (
    email: string,
    opts: { full_name: string; user_type: 'customer' | 'business' },
  ) => {
    const { data: existingUsers, error: usersErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (usersErr) throw usersErr;

    if (existingUsers?.id) return existingUsers.id as string;

    const { data: createdAuth, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'Password123!@#',
      email_confirm: true,
      user_metadata: { full_name: opts.full_name, user_type: opts.user_type },
    });
    if (createErr) throw createErr;

    const newId = createdAuth.user?.id as string;

    const { error: profileErr } = await supabaseAdmin.from('users').upsert(
      [
        {
          id: newId,
          email,
          full_name: opts.full_name,
          user_type: opts.user_type,
          phone: null,
          avatar_url: null,
        },
      ],
      { onConflict: 'id' },
    );
    if (profileErr) throw profileErr;

    return newId;
  };

  const ownerId = await ensureUser(ownerEmail, { full_name: 'Demo Business Owner', user_type: 'business' });
  const customerId = await ensureUser(customerEmail, { full_name: 'Demo Customer', user_type: 'customer' });

  const { data: existingBiz, error: bizErr } = await supabaseAdmin
    .from('businesses')
    .select('id')
    .eq('user_id', ownerId)
    .maybeSingle();
  if (bizErr) throw bizErr;

  let businessId = existingBiz?.id as string | undefined;
  if (!businessId) {
    const { data: bizCreated, error: createBizErr } = await supabaseAdmin
      .from('businesses')
      .insert([
        {
          user_id: ownerId,
          business_name: 'Elite Barber Shop',
          description: 'Premium grooming services since 2010',
          address: '123 Main Street, Anytown, USA',
          phone: '+1 (555) 123-4567',
          email: 'contact@elitebarbershop.com',
          website: 'https://elitebarbershop.com',
          instagram: 'https://instagram.com/elitebarbershop',
          facebook: 'https://facebook.com/EliteBarberShop',
          cover_photos: [
            'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=1200&h=600&fit=crop',
            'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&h=600&fit=crop',
          ],
          main_cover_photo:
            'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=1200&h=600&fit=crop',
        },
      ])
      .select('id')
      .single();
    if (createBizErr) throw createBizErr;
    businessId = bizCreated.id as string;
  }

  const baseServices = [
    { name: 'Haircut & Styling', description: 'Professional haircut with styling', duration: 45, price: 35.0, category: 'Hair' },
    { name: 'Beard Trim', description: 'Precision beard trimming and shaping', duration: 30, price: 20.0, category: 'Facial Hair' },
    { name: 'Hot Towel Shave', description: 'Traditional hot towel shave', duration: 45, price: 40.0, category: 'Facial Hair' },
  ];

  for (const s of baseServices) {
    const { error } = await supabaseAdmin.from('services').upsert(
      [
        {
          business_id: businessId,
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.price,
          category: s.category,
          is_active: true,
        },
      ],
      { onConflict: 'business_id,name' as unknown as string },
    );
    if (error) console.warn('[setup] upsert service warning', error);
  }

  const clients = [
    { name: 'John Smith', phone: '+1 555-0001', email: 'john.smith@example.com' },
    { name: 'Michael Johnson', phone: '+1 555-0002', email: 'michael.j@example.com' },
    { name: 'David Williams', phone: '+1 555-0003', email: 'david.w@example.com' },
  ];

  for (const c of clients) {
    const { error } = await supabaseAdmin.from('clients').insert([
      {
        business_id: businessId,
        customer_id: customerId,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: null,
        last_visit: null,
        visit_count: 0,
      },
    ]);
    if (error) console.warn('[setup] insert client warning', error);
  }

  return { status: 'ok' as const, businessId, ownerId, customerId };
}

export const setupStatusProcedure = publicProcedure.query(async () => {
  try {
    const exists = await tableExists('users');
    return { schemaReady: exists };
  } catch (e) {
    return { schemaReady: false, error: (e as Error).message };
  }
});

export const runSetupProcedure = protectedProcedure
  .input(z.object({ run: z.boolean().default(true) }))
  .mutation(async () => {
    const seeded = await ensureMockData();
    if (seeded.status === 'missing_schema') {
      return seeded;
    }

    await ensureBuckets();

    return { ...seeded, message: 'Setup completed' };
  });

export default runSetupProcedure;
