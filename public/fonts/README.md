# Fonts

This project uses the **29LT Adir** typeface (Arabic-first).

29LT Adir is a **commercial font** — you must purchase/license it from
[29LT](https://29lt.com/font/29lt-adir/) and drop the web font files here:

```
public/fonts/29LTAdir-Regular.woff2
public/fonts/29LTAdir-Medium.woff2
public/fonts/29LTAdir-Bold.woff2
```

The `@font-face` declarations in `src/app/globals.css` reference these paths.
If the files are missing, the UI falls back to the system Arabic UI font
(`Segoe UI` / `system-ui`) automatically — the app still works, just without
the branded typeface.
