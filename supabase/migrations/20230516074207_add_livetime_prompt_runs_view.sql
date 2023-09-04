alter table "public"."prompt_run_counts" drop column "count";

alter table "public"."prompt_run_counts" add column "value" bigint not null default '1'::bigint;

create or replace view "public"."lifetime_prompt_runs" as  SELECT u.id AS user_id,
    sum(COALESCE(t.value, (0)::bigint)) AS count
   FROM (auth.users u
     LEFT JOIN prompt_run_counts t ON ((t.user_id = u.id)))
  GROUP BY u.id;



