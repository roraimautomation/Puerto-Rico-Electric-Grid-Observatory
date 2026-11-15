-- Run in a new Supabase staging project first. This does not modify D1.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email text not null,
 role text not null default 'reader' check(role in ('reader','admin','updater')),
 status text not null default 'pending' check(status in ('pending','approved','suspended')),
 created_at timestamptz not null default now()
);
create table public.snapshots (
 id text primary key check(id='current'),
 payload jsonb not null check(jsonb_typeof(payload)='object'),
 updated_at timestamptz not null default now()
);
create table public.scenarios (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=150000),
 created_at timestamptz not null default now()
);
create index scenarios_owner_idx on public.scenarios(user_id,created_at desc);
create table public.audit_events (
 id bigint generated always as identity primary key,
 actor_id uuid,
 event_at timestamptz not null default now(),
 resource text not null,
 operation text not null,
 record_id text not null
);

alter table public.members enable row level security;
alter table public.snapshots enable row level security;
alter table public.scenarios enable row level security;
alter table public.audit_events enable row level security;
revoke all on public.members,public.snapshots,public.scenarios,public.audit_events from public,anon,authenticated;
grant select on public.members,public.snapshots,public.scenarios,public.audit_events to authenticated;
grant insert,update on public.snapshots to authenticated;
grant insert,update,delete on public.scenarios to authenticated;

-- SECURITY DEFINER avoids recursive membership policies. Owner must remain trusted.
create function private.active_role() returns text language sql stable security definer set search_path='' as $$
 select role from public.members where user_id=(select auth.uid()) and status='approved'
$$;
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(private.active_role()='admin' and (select auth.jwt()->>'aal')='aal2',false)
$$;
create function private.can_write_inventory() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(private.active_role()='updater' or private.is_admin(),false)
$$;
revoke all on function private.active_role(),private.is_admin(),private.can_write_inventory() from public,anon;
grant execute on function private.active_role(),private.is_admin(),private.can_write_inventory() to authenticated;

create policy members_read on public.members for select to authenticated
 using(user_id=(select auth.uid()) or (select private.is_admin()));
-- No browser/client INSERT, UPDATE or DELETE privilege on memberships.
create policy snapshots_read on public.snapshots for select to authenticated
 using((select private.active_role()) is not null);
create policy snapshots_insert on public.snapshots for insert to authenticated
 with check((select private.can_write_inventory()));
create policy snapshots_update on public.snapshots for update to authenticated
 using((select private.can_write_inventory())) with check((select private.can_write_inventory()));
-- No deletion policy for inventory.
create policy scenarios_read on public.scenarios for select to authenticated
 using(user_id=(select auth.uid()) and (select private.active_role()) in ('reader','admin'));
create policy scenarios_insert on public.scenarios for insert to authenticated
 with check(user_id=(select auth.uid()) and (select private.active_role()) in ('reader','admin'));
create policy scenarios_update on public.scenarios for update to authenticated
 using(user_id=(select auth.uid()) and (select private.active_role()) in ('reader','admin'))
 with check(user_id=(select auth.uid()) and (select private.active_role()) in ('reader','admin'));
create policy scenarios_delete on public.scenarios for delete to authenticated
 using(user_id=(select auth.uid()) and (select private.active_role()) in ('reader','admin'));
create policy audit_read on public.audit_events for select to authenticated
 using((select private.is_admin()));

create function private.create_member() returns trigger language plpgsql security definer set search_path='' as $$
 begin
  insert into public.members(user_id,email) values(new.id,coalesce(new.email,''));
  return new;
 end
$$;
revoke all on function private.create_member() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.create_member();
-- User-controlled metadata never assigns role or approval status.
create function private.sync_member_email() returns trigger language plpgsql security definer set search_path='' as $$
 begin update public.members set email=coalesce(new.email,'') where user_id=new.id;return new;end
$$;
revoke all on function private.sync_member_email() from public,anon,authenticated;
create trigger on_auth_email_changed after update of email on auth.users for each row execute function private.sync_member_email();

-- Only approved MFA administrators may approve/suspend reader accounts.
-- Initial admin and service account roles are provisioned by a trusted SQL operator.
create function public.set_reader_status(target_user uuid,new_status text) returns void
 language plpgsql security definer set search_path='' as $$
 begin
  if not private.is_admin() then raise insufficient_privilege using message='Administrator with MFA required';end if;
  if new_status not in ('approved','suspended') then raise check_violation using message='Invalid status';end if;
  update public.members set status=new_status where user_id=target_user and role='reader';
  if not found then raise insufficient_privilege using message='Only reader accounts may be managed here';end if;
 end
$$;
revoke all on function public.set_reader_status(uuid,text) from public,anon;
grant execute on function public.set_reader_status(uuid,text) to authenticated;

create function private.audit_change() returns trigger language plpgsql security definer set search_path='' as $$
 declare key_value text;
 begin
  if TG_TABLE_NAME='members' then key_value=new.user_id::text;else key_value=new.id::text;end if;
  insert into public.audit_events(actor_id,resource,operation,record_id) values(auth.uid(),TG_TABLE_NAME,TG_OP,key_value);
  return new;
 end
$$;
revoke all on function private.audit_change() from public,anon,authenticated;
create trigger snapshots_audit after insert or update on public.snapshots for each row execute function private.audit_change();
create trigger members_audit after insert or update on public.members for each row execute function private.audit_change();
-- Serialize inserts per owner so concurrent requests cannot exceed four saved scenarios.
create function private.limit_scenarios() returns trigger language plpgsql security definer set search_path='' as $$
 begin
  if new.user_id is distinct from auth.uid() or private.active_role() not in ('reader','admin') or private.active_role() is null then
   raise insufficient_privilege using message='Approved owner required';
  end if;
  perform 1 from public.members where user_id=new.user_id for update;
  if (select count(*) from public.scenarios where user_id=new.user_id)>=4 then
   raise check_violation using message='At most four scenarios per account';
  end if;
  return new;
 end
$$;
revoke all on function private.limit_scenarios() from public,anon,authenticated;
create trigger scenario_quota before insert on public.scenarios for each row execute function private.limit_scenarios();
commit;
