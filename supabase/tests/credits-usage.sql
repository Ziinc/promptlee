
-- consume credits

BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(4);
select has_view( 'prompt_run_counts' );
select has_view( 'credit_history' );


SELECT tests.create_supabase_user('test_user2');
select tests.authenticate_as('test_user2');
insert into prompt_run_credits (user_id, value)  values (tests.get_supabase_uid('test_user2'), -1);
SELECT tests.clear_authentication();


SELECT tests.create_supabase_user('test_user3');


-- insert older records, bypass RLS
set role postgres;
insert into prompt_run_credits (created_at, user_id, value)  values ((now() - interval '3 day')::timestamp, tests.get_supabase_uid('test_user3'), 120);
insert into prompt_run_credits (created_at, user_id, value)  values ((now() - interval '5 day')::timestamp, tests.get_supabase_uid('test_user3'), 50);

select tests.authenticate_as('test_user3');

-- consume credits normally, should pass RLS
insert into prompt_run_credits (user_id, value)  values (tests.get_supabase_uid('test_user3'), -3);


select results_eq( 
    $$
    select consumed, added, balance from credit_history limit 1
    $$, 
    'select 3::bigint as consumed, 0::bigint as added, 217::bigint as balance', 
    'credit balance calculated correctly');


select results_eq( 
    $$
    select consumed, added, balance from daily_credit_history order by date desc limit 1
    $$, 
    'select 3::bigint as consumed, 50::bigint as added, 217::bigint as balance', 
    'daily credit balance calculated correctly');


SELECT finish();
ROLLBACK;