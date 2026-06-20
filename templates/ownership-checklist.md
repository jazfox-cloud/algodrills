# Ownership and Control Checklist

Use this checklist before deployment, and before direct migration in `owned_migration` mode.

## Source Summary

Record:

- Target domain:
- Source material type: Wayback archive / user export / pasted text / old CMS / other
- Approximate page count:
- New destination:

## Mode Question

Ask the user to confirm one of these statements:

1. Public recovery: "I do not own or control the old domain. Use archived material only as research and rewrite from scratch."
2. Owned migration: "I or my company owns the source content and has the right to reuse and modify it."
3. Redirect control: "I or my company controls the old domain and can configure redirects."

If the user does not confirm owned migration, use `public_recovery`.

If the user does not confirm redirect control, do not generate old-domain 301 redirects.

## Record Format

Write the result into `reports/recovery-report.md`:

```text
Recovery mode:
Ownership/control statement:
Redirect eligibility:
Notes:
```

## Stop Conditions

Do not rewrite or deploy content when:

- The user says the content belongs to another person/company and they do not have permission.
- The content includes sensitive personal information that cannot be safely removed.
- The task depends on impersonating the old brand or pretending to be the original owner.
- The user requests old-domain redirects but cannot confirm control of the old domain.
