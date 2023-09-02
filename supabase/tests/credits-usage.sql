
-- consume credits

BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(5);
select has_view( 'prompt_run_counts' );
select has_view( 'credit_history' );

SELECT tests.create_supabase_user('test_user3');
select tests.authenticate_as('test_user3');

prepare insert_run as insert into prompt_run_credits (user_id, value)  values (tests.get_supabase_uid('test_user3') , -1);
select performs_ok('insert_run', 100, 'consume credits');

select results_eq( 
    $$
    select consumed, added, balance from credit_history where tests.get_supabase_uid('test_user3') = user_id limit 1
    $$, 
    'select 1::int as consumed, 100::int as added, 99::int as  balance', 
    'credit balance calculated correctly');


select results_eq( 
    $$
    select consumed, added, balance from daily_credit_history where tests.get_supabase_uid('test_user3') = user_id limit 1
    $$, 
    'select 1::int as consumed, 100::int as added, 99::int as  balance', 
    'daily credit balance calculated correctly');


SELECT finish();
ROLLBACK;