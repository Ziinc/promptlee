# PromptPro

> The Prompt Engineering Toolkit

A webapp focused on prompt engineering and iterative prompt development. Interacts directly with ChatGPT API. Privacy focused, Bring Your Own API Keys.

- [Website](https://promptpro.tznc.net)
- [Documentation](https://promptpro.tznc.net/docs)
- [Blog](https://promptpro.tznc.net/blog)
<!-- - [Blog](https://promptpro.tznc.net/blog) -->
- [Webapp - app.promptpro.tznc.net](https://app.promptpro.tznc.net)

## License

[Apache V2 licensed](./LICENSE)

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