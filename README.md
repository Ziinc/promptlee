# Promptlee

> The Prompt Engineering Toolkit

A webapp focused on prompt engineering and iterative prompt development. Interacts directly with ChatGPT API. Privacy focused, Bring Your Own API Keys.

- [Website](https://promptlee.tznc.net)
- [Documentation](https://docs/promptlee.tznc.net/docs)
- [Blog](https://docs/promptlee.tznc.net/blog)

## Developer

```bash
# To develop editor
npm run dev

# To develop the extension
npm run build:app:firefox -- --watch
npm run serve:firefox

# save sb studio changes locally
supabase db diff -f my_migration_file
```

Admin functions

```sql
-- give a user credits
select insert_free_credits('2f991f94-0aeb-4146-9897-601e8e3019a5'::uuid, 123);
```

## License

[Apache V2 licensed](./LICENSE)
