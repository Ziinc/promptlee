create table "public"."flow_versions" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "nodes" jsonb[] not null default '{}'::jsonb[],
    "edges" jsonb[] not null default '{}'::jsonb[],
    "flow_id" uuid not null
);


alter table "public"."flow_versions" enable row level security;

CREATE UNIQUE INDEX flow_versions_pkey ON public.flow_versions USING btree (id);

alter table "public"."flow_versions" add constraint "flow_versions_pkey" PRIMARY KEY using index "flow_versions_pkey";

alter table "public"."flow_versions" add constraint "flow_versions_flow_id_fkey" FOREIGN KEY (flow_id) REFERENCES flows(id) not valid;

alter table "public"."flow_versions" validate constraint "flow_versions_flow_id_fkey";

create policy "Enable flow version history read for flows that user owns"
on "public"."flow_versions"
as permissive
for select
to authenticated
using ((( SELECT f.user_id
   FROM flows f
  WHERE (f.id = flow_versions.flow_id)) = auth.uid()));


create policy "Enable insert for authenticated users only"
on "public"."flow_versions"
as permissive
for insert
to authenticated
with check ((( SELECT f.user_id
   FROM flows f
  WHERE (f.id = flow_versions.flow_id)) = auth.uid()));



