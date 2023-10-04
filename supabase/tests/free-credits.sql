BEGIN;
CREATE EXTENSION "basejump-supabase_test_helpers";

select plan(2);

select has_table( 'prompt_run_credits' );

SELECT tests.create_supabase_user('test_user');
SELECT tests.create_supabase_user('test_user2');

select tests.authenticate_as('test_user2');
select insert_free_credits(tests.get_supabase_uid('test_user2') , 144);

select tests.authenticate_as('test_user');
-- free credits should be credited automatically
select results_eq( 
    $$
    select free, value from prompt_run_credits c where tests.get_supabase_uid('test_user') = c.user_id
    $$, 
    'select true as free, 50::bigint as value', 
    'free credits are credited created on account creation');

SELECT finish();
ROLLBACK;