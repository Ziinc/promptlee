create table "public"."prompt_run_counts" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone default now(),
    "flow_id" uuid not null,
    "count" bigint not null default '1'::bigint,
    "user_id" uuid not null
);


alter table "public"."prompt_run_counts" enable row level security;

CREATE UNIQUE INDEX prompt_run_counts_pkey ON public.prompt_run_counts USING btree (id);

alter table "public"."prompt_run_counts" add constraint "prompt_run_counts_pkey" PRIMARY KEY using index "prompt_run_counts_pkey";

alter table "public"."prompt_run_counts" add constraint "prompt_run_counts_flow_id_fkey" FOREIGN KEY (flow_id) REFERENCES flows(id) not valid;

alter table "public"."prompt_run_counts" validate constraint "prompt_run_counts_flow_id_fkey";

alter table "public"."prompt_run_counts" add constraint "prompt_run_counts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."prompt_run_counts" validate constraint "prompt_run_counts_user_id_fkey";


