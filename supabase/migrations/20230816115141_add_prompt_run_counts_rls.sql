alter table "public"."prompt_run_counts" alter column "flow_id" drop not null;

alter table "public"."prompt_run_counts" add constraint "prompt_run_counts_value_check" CHECK ((value > 0)) not valid;

alter table "public"."prompt_run_counts" validate constraint "prompt_run_counts_value_check";

create policy "Enable insert for authenticated users only"
on "public"."prompt_run_counts"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable select own for authenticated users only"
on "public"."prompt_run_counts"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));



