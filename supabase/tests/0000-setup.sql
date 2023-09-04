select dbdev.install('basejump-supabase_test_helpers');
BEGIN;
select plan(1);
select is(1, 1);
SELECT * FROM finish();