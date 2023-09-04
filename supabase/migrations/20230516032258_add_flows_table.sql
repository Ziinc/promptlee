create table "public"."flows" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "user_id" uuid not null,
    "name" text not null default 'Untitled Flow'::text
);


alter table "public"."flows" enable row level security;

CREATE UNIQUE INDEX flows_pkey ON public.flows USING btree (id);

alter table "public"."flows" add constraint "flows_pkey" PRIMARY KEY using index "flows_pkey";

alter table "public"."flows" add constraint "flows_name_check" CHECK ((length(name) > 3)) not valid;

alter table "public"."flows" validate constraint "flows_name_check";

alter table "public"."flows" add constraint "flows_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."flows" validate constraint "flows_user_id_fkey";

create policy "Enable insert for authenticated users only"
on "public"."flows"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Enable read access for user's own flows"
on "public"."flows"
as permissive
for select
to authenticated
using ((auth.uid() = user_id));


create policy "Users can only update their own flows"
on "public"."flows"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



