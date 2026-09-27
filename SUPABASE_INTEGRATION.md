SUPABASE INTEGRATION & RECENT CHANGES
====================================

This project uses Supabase as its Postgres + Auth + Storage backend. Recent changes
added host-targeted chat fields and RLS policies; to complete the integration do
these steps (or ask a DBA/dev to run the SQL in supabase/sql_apply_for_editor.sql):

1) Environment
    - Add environment variables (dev and production):
       `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
       for client/authenticated requests, and `SUPABASE_SECRET_KEY` for trusted
       server-side admin operations. Existing projects may use
       `SUPABASE_SERVICE_ROLE_KEY` instead.
   - Never commit keys to the repository.

   For Vercel, add these in Project Settings > Environment Variables for
   Production and Preview as appropriate. The URL and publishable key are
   public configuration; keep `SUPABASE_SECRET_KEY` server-only.
   Redeploy after changing environment variables. `.env.example` lists the
   expected names without containing real credentials.

2) Deploy to Vercel
   - Import the repository and use the project root as the Root Directory.
   - The checked-in `vercel.json` configures `npm ci`, `npm run build`, and
     Nitro's `.vercel/output` directory. Do not override these in Project
     Settings unless intentionally changing the build.
   - Configure the Supabase environment variables above before deploying.
   - Apply the required Supabase SQL migrations before testing production.

3) Apply DB migration (SQL editor)
   - Open Supabase Console > SQL Editor > New query
   - Paste supabase/sql_apply_for_editor.sql and run it.
   - That SQL does:
     * Adds chat_messages.to_host_id (uuid) referencing auth.users
     * Creates chat_message_reads for per-user read tracking
   * Enables chat-message RLS with scoped member read/insert policies
   * Removes direct client updates to chat messages

4) Apply security hardening migrations (SQL editor)
   - Run these migrations in timestamp order after the base schema and chat SQL:
     `supabase/migrations/20260927090000_fix_image_limits_and_rls_warnings.sql`
     `supabase/migrations/20260927140000_revoke_self_host_insert.sql`
     `supabase/migrations/20260927150000_harden_profile_billing_and_qr_access.sql`
     `supabase/migrations/20260927160000_scope_building_reads_and_code_lookup.sql`
   - They remove self-assigned host access; restrict profile, building, host-request, and chat writes; scope building/room reads to members; make maintenance QR files private; and rate-limit exact building-code lookups.
   - Host/resident mode is user-selectable UI state, not an authorization role. The server derives the caller from the verified Supabase access token.
   - If a legacy `sql_complete_setup.sql` or `sql_full_setup*.sql` is used to bootstrap a database, apply all four hardening migrations afterward. Do not treat the legacy bootstrap script as the final RLS state.

5) Verify app linkage
   - Confirm SUPABASE_URL and keys are reachable from your dev host.
   - Run: npm ci && npm run build && npm run dev
   - Open the app and test the following flows:
     * Role Switcher: Toggle between Host and Resident in Navbar / Profile.
     * Host role: "Register a Building" is visible and creates buildings successfully.
     * Resident role: "Register a Building" is hidden; visiting `/register-building` displays a 403 Forbidden Access Denied screen.
     * Search: try legacy codes (BLD-3MLU, B-LD-3MLU) and canonical codes (B-XXXXXX)
     * Resident chat: resident must select a host from the building's hosts list
     * Host view: hosts only see messages targeted to them or broadcasts
     * Host removal: primary host can remove secondary hosts (status -> 'removed')

6) If you prefer a safe staged rollout
   - Apply the SQL in a staging Supabase project first.
   - Test search and chat UX thoroughly, especially RLS behaviors.

7) Need help running the SQL or applying the env?
   - Never share a Supabase secret/service-role key. Run migrations yourself in the Supabase SQL Editor or through the Supabase CLI.


Notes
-----
- If a rollback is required after applying this migration, do NOT run the same SQL — request a rollback script from me and I will prepare one targeted to your state.
- The service-role key bypasses RLS — keep it secret and only use it for server/admin migrations.
- After applying, test the flows thoroughly (especially multi-host chat visibility and host-removal workflows).
