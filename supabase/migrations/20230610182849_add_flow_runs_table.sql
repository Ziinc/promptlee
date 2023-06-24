create extension if not exists "http" with schema "extensions";


create table "public"."flow_runs" (
    "id" uuid not null default gen_random_uuid(),
    "started_at" timestamp with time zone not null default now(),
    "stopped_at" timestamp with time zone,
    "flow_version_id" uuid not null,
    "inputs" jsonb not null default '{}'::jsonb,
    "outputs" jsonb not null,
    "status" text not null default ''::text
);


alter table "public"."flow_runs" enable row level security;

CREATE UNIQUE INDEX flow_runs_pkey ON public.flow_runs USING btree (id);

alter table "public"."flow_runs" add constraint "flow_runs_pkey" PRIMARY KEY using index "flow_runs_pkey";

alter table "public"."flow_runs" add constraint "flow_runs_flow_version_id_fkey" FOREIGN KEY (flow_version_id) REFERENCES flow_versions(id) not valid;

alter table "public"."flow_runs" validate constraint "flow_runs_flow_version_id_fkey";

alter table "public"."flow_runs" add constraint "flow_runs_status_check" CHECK ((status = ANY (ARRAY['started'::text, 'running'::text, 'complete'::text, 'error'::text]))) not valid;

alter table "public"."flow_runs" validate constraint "flow_runs_status_check";


