drop policy "Enable insert for authenticated users only" on "public"."prompt_run_counts";

drop policy "Enable select own for authenticated users only" on "public"."prompt_run_counts";

alter table "public"."prompt_run_counts" drop constraint "prompt_run_counts_flow_id_fkey";

alter table "public"."prompt_run_counts" drop constraint "prompt_run_counts_user_id_fkey";

alter table "public"."prompt_run_counts" drop constraint "prompt_run_counts_value_check";

drop view if exists "public"."lifetime_prompt_runs";

alter table "public"."prompt_run_counts" drop constraint "prompt_run_counts_pkey";

drop index if exists "public"."prompt_run_counts_pkey";

drop table "public"."prompt_run_counts";

alter table "public"."prompt_run_credits" add column "flow_id" uuid;

alter table "public"."prompt_run_credits" add constraint "prompt_run_credits_flow_id_fkey" FOREIGN KEY (flow_id) REFERENCES flows(id) not valid;

alter table "public"."prompt_run_credits" validate constraint "prompt_run_credits_flow_id_fkey";

create or replace view "public"."credit_balance" as  SELECT t.user_id,
    sum(t.value) AS balance
   FROM prompt_run_credits t
  GROUP BY t.user_id;


create or replace view "public"."prompt_run_counts" as  SELECT date_trunc('day'::text, t.created_at) AS date,
    t.user_id,
    count(t.id) AS count
   FROM prompt_run_credits t
  WHERE (t.value < 0)
  GROUP BY (date_trunc('day'::text, t.created_at)), t.user_id;



drop view if exists "public"."credit_balance";

create or replace view "public"."credit_history" as  SELECT t.created_at,
    t.value,
    t.free,
    t.user_id,
    (sum(t.value) FILTER (WHERE (t.value > 0)) OVER (ORDER BY t.rn))::integer AS added,
    abs(COALESCE(sum(t.value) FILTER (WHERE (t.value < 0)) OVER (ORDER BY t.rn), 0))::integer AS consumed,
    (sum(t.value) OVER (ORDER BY t.rn))::integer AS balance
   FROM ( SELECT c.id,
            c.created_at,
            c.user_id,
            c.value,
            c.free,
            c.flow_id,
            row_number() OVER (ORDER BY c.created_at) AS rn
           FROM prompt_run_credits c) t
  ORDER BY t.rn DESC;

create or replace view "public"."daily_credit_history" as 
select 
    t.date,
    t.added,
    t.consumed,
    t.balance,
    t.user_id
 from (
     SELECT c.*,
        date_trunc('day', c.created_at) as date,
        row_number() OVER (partition by date_trunc('day', c.created_at)  ORDER BY c.created_at desc) AS rn
           FROM credit_history c
 ) t
 where t.rn = 1;

create policy "Enable insert for credit consumption for authenticated"
on "public"."prompt_run_credits"
as permissive
for insert
to authenticated
with check ((value < 0));