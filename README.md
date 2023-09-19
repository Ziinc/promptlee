# Promptlee

> AI Browser Automation

An AI assistant in the browser.

- [Website](https://promptlee.tznc.net)
- [Documentation](https://docs.promptlee.tznc.net)
- [Blog](https://docs.promptlee.tznc.net/blog)

## Developer

```bash
# To develop
npm start
npm run dev
npm test
npm run test:sb

# To develop the extension
npm run build:firefox -- --watch
npm run serve:firefox

# save sb studio changes locally
supabase db diff -f my_migration_file

# update generated db types
npm run types
```

Admin functions

```sql
-- give a user credits
select insert_free_credits('2f991f94-0aeb-4146-9897-601e8e3019a5'::uuid, 123);
```

## License

[Apache V2 licensed](./LICENSE)
