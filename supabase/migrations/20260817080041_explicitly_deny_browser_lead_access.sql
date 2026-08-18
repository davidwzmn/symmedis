drop policy if exists website_leads_deny_browser_access on public.website_leads;
create policy website_leads_deny_browser_access
on public.website_leads
for all
to anon, authenticated
using (false)
with check (false);
