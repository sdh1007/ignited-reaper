# IONOS Upload Instructions

## Static Build Complete! 🎉

Your Next.js IgNited Reaper app has been successfully built as static files and is ready for IONOS hosting.

## What to Upload

Upload **ALL contents** from the `ignited-reaper-static/` folder to your IONOS webspace **root directory** (`/`).

### Files to Upload:

- `index.html` (main page)
- `404.html` (error page)
- `moderation/` (moderation dashboard)
- `_next/` (Next.js assets)
- `reaper-logo.svg` (logo)
- `scottyd616_httpss.mj.runoCmlTlUeGV8_Minimalist_line-art_evoluti_834843ba-bd07-4b7e-b320-021986dfbee6.svg` (logo variant)
- `simple.html` (simple version)
- `working.html` (working version)

## Upload Steps

1. **Open IONOS File Manager**
2. **Navigate to root directory** (`/`)
3. **Delete existing files** (if any) that are causing 403 errors
4. **Upload all files** from `ignited-reaper-static/` folder
5. **Set permissions** to `644` for HTML files and `755` for directories
6. **Test the site** at `ignitedreaper.com`

## File Structure After Upload

```
/ (root)
├── index.html
├── 404.html
├── moderation/
│   └── index.html
├── _next/
│   ├── static/
│   └── ...
├── reaper-logo.svg
├── scottyd616_httpss.mj.runoCmlTlUeGV8_Minimalist_line-art_evoluti_834843ba-bd07-4b7e-b320-021986dfbee6.svg
├── simple.html
└── working.html
```

## Features Included

✅ **3D Cemetery Environment** - Interactive gravestones and atmospheric effects
✅ **Mobile Responsive** - Works on all devices
✅ **Moderation Dashboard** - Available at `/moderation`
✅ **Static Assets** - All images, CSS, and JavaScript included
✅ **SEO Optimized** - Proper meta tags and structure

## Troubleshooting

- **403 Forbidden**: Make sure `index.html` is in the root directory
- **404 Errors**: Check that all files were uploaded correctly
- **Missing Assets**: Ensure `_next/` folder is uploaded with all contents

## Next Steps

After upload, your site will be fully functional at `ignitedreaper.com` with:

- Beautiful 3D cemetery interface
- Interactive gravestones
- Day/night mode toggle
- Mobile-friendly design
- Moderation capabilities

The static build eliminates all server-side dependencies and works perfectly on IONOS webspace hosting!
