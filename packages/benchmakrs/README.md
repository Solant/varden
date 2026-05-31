# Varden Benchmarks

Performance benchmarks comparing [varden](../varden) against [vee-validate](https://vee-validate.logaretm.com/) (v4 stable and v5 beta) for Vue 3 form handling.

## What's measured

- **Form creation** — cost of initializing a `useForm` instance (scoped per run, then stopped)
- **setValue** — cost of setting field values one character at a time, simulating user typing

Both benchmarks run against two Valibot schemas:

- `logInSchema` — small form (email + password)
- `signUpSchema` — moderate form (mixed types, nested objects, arrays)

## Libraries under test

| Library | Import | Notes |
|---|---|---|
| varden | `varden` | Workspace package |
| vee-validate@4 | `vee-validate4` | Latest v4 stable, wrapped with `@vee-validate/valibot` |
| vee-validate@5 | `vee-validate5` | v5 beta (native Valibot support) |

## Usage

```sh
# Run all benchmarks
pnpm bench
```

## Structure

- `bench/schemas.ts` — Valibot schemas used across benchmarks
- `bench/creation.bench.ts` — form creation benchmarks
- `bench/operations.bench.ts` — setValue benchmarks
- `bench/setup.ts` — suppresses console warnings during bench runs
- `pages/` — interactive demo pages for visual comparison (`vee-validate/`, `varden/`)

## Demo pages

```sh
# Start dev server, then navigate to /pages/vee-validate or /pages/varden
pnpm dev
```
