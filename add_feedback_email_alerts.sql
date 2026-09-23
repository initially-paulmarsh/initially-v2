-- INITIALLY v2 -- email every new feedback message to
-- feedback@initially-app.com (forwarded by Cloudflare Email Routing).
-- Run in the Supabase SQL Editor, after add_feedback.sql.
--
-- Sends through the same Resend account as the sign-in emails. The API key
-- lives in Supabase Vault, not in this file or the repo: replace
-- PASTE_YOUR_RESEND_KEY_HERE below in the SQL Editor only, never commit it.
--
-- pg_net makes the HTTP call asynchronously, so a Resend outage or a bad
-- key never blocks or fails the player's feedback insert -- the row is
-- saved either way and still readable in Table Editor > feedback.

create extension if not exists pg_net;

-- Store (or replace) the Resend key in Vault.
do $$
declare
  existing uuid;
begin
  select id into existing from vault.secrets where name = 'resend_api_key';
  if existing is null then
    perform vault.create_secret('PASTE_YOUR_RESEND_KEY_HERE', 'resend_api_key', 'Resend key for feedback alert emails');
  else
    perform vault.update_secret(existing, 'PASTE_YOUR_RESEND_KEY_HERE');
  end if;
end;
$$;

create or replace function public.email_new_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';
  if api_key is null then
    return new;
  end if;

  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    -- jsonb_strip_nulls drops reply_to when the player left no email, which
    -- Resend would otherwise reject. With an email, hitting Reply in your
    -- inbox answers the player directly.
    body := jsonb_strip_nulls(jsonb_build_object(
      'from', 'Initially Feedback <hello@initially-app.com>',
      'to', jsonb_build_array('feedback@initially-app.com'),
      'reply_to', new.contact_email,
      'subject', 'New Initially feedback (' || coalesce(new.platform, 'unknown') || ')',
      'text', new.message
        || E'\n\n---\n'
        || 'Reply to: ' || coalesce(new.contact_email, '(no email given)') || E'\n'
        || 'Signed in: ' || case when new.user_id is null then 'no' else 'yes' end || E'\n'
        || 'Sent: ' || to_char(new.created_at at time zone 'Europe/London', 'DD Mon YYYY HH24:MI') || ' UK'
    ))
  );
  return new;
end;
$$;

revoke execute on function public.email_new_feedback() from public, anon, authenticated;

drop trigger if exists on_feedback_email on public.feedback;
create trigger on_feedback_email
  after insert on public.feedback
  for each row execute function public.email_new_feedback();
