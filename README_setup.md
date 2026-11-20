# Setup — Google Search Console sitemap resubmission

arr can resubmit `https://<domain>/sitemap.xml` to Google Search Console
after every publish-affecting write (debounced to one call per batch —
`src/hooks/resubmitSitemap.ts`, `src/lib/searchConsole.ts`, decision D10).
This is optional: robots.txt discovery and `<lastmod>` keep working
without it. When enabled, the sitemap also becomes visible in the GSC
Sitemaps report with fetch status and errors.

Authentication is a Google Cloud **service account** added as a user on
the Search Console property. Setup is one-time per site.

## 1. Create the service account

In the [Google Cloud console](https://console.cloud.google.com):

1. Create or select a project (one project can serve all arr sites).
2. Enable the **Google Search Console API** at
   <https://console.cloud.google.com/apis/library/searchconsole.googleapis.com>
   (`APIs & Services → Library → "Google Search Console API" → Enable`).
3. Create the service account at
   <https://console.cloud.google.com/iam-admin/serviceaccounts>
   (`Create service account`), or via `APIs & Services → Credentials →
   Create credentials → Service account`. No project role is needed —
   Search Console grants the rights, not IAM.
4. Create a JSON key on that account (service account → `Keys → Add key
   → Create new key → JSON`). The file downloads once; store it in the
   vault, never in the repository.

## 2. Authorize it in Search Console

Per site, in [Search Console](https://search.google.com/search-console):

1. Open the property covering the site (a `sc-domain:` property covers
   all subdomains and schemes; a URL-prefix property only its exact
   prefix).
2. `Settings → Users and permissions → Add user`, enter the service
   account e-mail (`<name>@<project>.iam.gserviceaccount.com`) with
   permission **Full** — Restricted cannot submit sitemaps (API returns
   403), Owner is not required.

## 3. Configure the container

Three env vars — all or none (missing/partial config disables the
feature silently). Values belong in the Ansible vault /
`payload_instance_secrets` in `wit.docker_apps`, never in the repo.

| Variable | Value |
|---|---|
| `GSC_SITE` | Property id exactly as SC defines it: `sc-domain:example.com` for a domain property, or `https://example.com/` (trailing slash) for a URL-prefix property |
| `GSC_CLIENT_EMAIL` | The service account e-mail (`client_email` in the JSON key) |
| `GSC_PRIVATE_KEY` | The `private_key` PEM from the JSON key, with real newlines escaped as `\n` — the app unescapes them |

The submitted sitemap URL is built from the public origin —
`NEXT_PUBLIC_SERVER_URL` (already set per instance by the role), then
`SITE_URL`, then the request origin, with a `GSC_SITE`-derived URL as
last resort. It must never be the container's internal listen address.

```yaml
# wit.docker_apps host vars (vault)
GSC_SITE: "sc-domain:example.com"
GSC_CLIENT_EMAIL: "arr-sitemap@<project>.iam.gserviceaccount.com"
GSC_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 4. Verify

After deploy, publish (or edit and re-publish) any page in `/admin`,
wait ~1 minute (the submit is debounced), then:

```sh
docker logs <container> | grep searchConsole   # silent = success
```

Errors appear as `[searchConsole] sitemap submit failed:` — common
causes: `403` → the service account is not a Full user on the property,
or `GSC_SITE` does not match the property form (`sc-domain:` vs
URL-prefix); `400`/`404` → malformed `GSC_SITE` or a key that could not
be parsed.

In Search Console, `Indexing → Sitemaps` then lists the submitted
`sitemap.xml` with last-read date and status.

## Notes

- One service account can be a user on several properties — reuse it
  per site, varying only `GSC_SITE`.
- The JSON key is a credential with write access to the property's
  sitemap list: rotate it like any other vault secret; deleting the key
  in Cloud console revokes it.
- Resubmission is a hint, not a guarantee — Google still schedules
  crawling itself. See `src/lib/searchConsole.ts` and
  `+intent/decisions.md` (D10).
