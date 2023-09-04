drop policy "Users can only update their own flows" on "public"."flows";

alter table "public"."flow_runs" add column "flow_id" uuid not null;

alter table "public"."flow_runs" add constraint "flow_runs_flow_id_fkey" FOREIGN KEY (flow_id) REFERENCES flows(id) not valid;

alter table "public"."flow_runs" validate constraint "flow_runs_flow_id_fkey";

create policy "Enable insert for authenticated users only"
on "public"."flow_runs"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read access for authenticated"
on "public"."flow_runs"
as permissive
for select
to authenticated
using ((( SELECT f.user_id
   FROM flows f
  WHERE (f.id = flow_runs.flow_id)) = auth.uid()));


create policy "Enable update for authenticated"
on "public"."flow_runs"
as permissive
for update
to authenticated
using ((auth.uid() IS NOT NULL))
with check ((auth.uid() IS NOT NULL));


create policy "Users can only update their own flows"
on "public"."flows"
as permissive
for update
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



