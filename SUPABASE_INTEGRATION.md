SUPABASE INTEGRATION & RECENT CHANGES
====================================

This project uses Supabase as its Postgres + Auth + Storage backend. Recent changes
added host-targeted chat fields and RLS policies; to complete the integration do
these steps (or ask a DBA/dev to run the SQL in supabase/sql_apply_for_editor.sql):

1) Environment
   - Add environment variables (dev and production):
     VITE_SUPABASE_URL (client), VITE_SUPABASE_PUBLISHABLE_KEY (client)
     SUPABASE_SERVICE_ROLE_KEY (server/migration)
   - Never commit keys to the repository.

2) Apply DB migration (SQL editor)
   - Open Supabase Console > SQL Editor > New query
   - Paste supabase/sql_apply_for_editor.sql and run it.
   - That SQL does:
     * Adds chat_messages.to_host_id (uuid) referencing auth.users
     * Creates chat_message_reads for per-user read tracking
     * Enables and sets RLS policies for chat_messages (select/insert/update)
     * Creates a helper function to search buildings by candidate codes

3) Role-Based Building Registration Migration (SQL editor)
   - Open Supabase Console > SQL Editor > New query
   - Run `supabase/sql_apply_role_authorization.sql` (or `supabase/migrations/20260816124500_role_based_building_registration.sql`)
   - That SQL restricts building creation (`INSERT` on `public.buildings`) strictly to authenticated users with `user_metadata.role = 'host'`.

4) Verify app linkage
   - Confirm SUPABASE_URL and keys are reachable from your dev host.
   - Run: npm install && npm run build && npm run dev
   - Open the app and test the following flows:
     * Role Switcher: Toggle between Host and Resident in Navbar / Profile.
     * Host role: "Register a Building" is visible and creates buildings successfully.
     * Resident role: "Register a Building" is hidden; visiting `/register-building` displays a 403 Forbidden Access Denied screen.
     * Search: try legacy codes (BLD-3MLU, B-LD-3MLU) and canonical codes (B-XXXXXX)
     * Resident chat: resident must select a host from the building's hosts list
     * Host view: hosts only see messages targeted to them or broadcasts
     * Host removal: primary host can remove secondary hosts (status -> 'removed')

5) If you prefer a safe staged rollout
   - Apply the SQL in a staging Supabase project first.
   - Test search and chat UX thoroughly, especially RLS behaviors.

6) Need help running the SQL or applying the env?
   - Provide a Supabase service-role key (temporary) and I can run the migration and validate for you, or run the SQL yourself using the file supabase/sql_apply_role_authorization.sql


Notes
-----
- If a rollback is required after applying this migration, do NOT run the same SQL — request a rollback script from me and I will prepare one targeted to your state.
- The service-role key bypasses RLS — keep it secret and only use it for server/admin migrations.
- After applying, test the flows thoroughly (especially multi-host chat visibility and host-removal workflows).
