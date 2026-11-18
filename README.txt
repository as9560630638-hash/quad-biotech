QUAD BIOTECH — WEBSITE DELIVERY
================================

WHAT'S INSIDE
- index.html          Homepage
- softgel.html        About Softgel page
- style.css           All styling
- script.js           All interactions
- .htaccess           Server config (security, compression, caching)
- assets/img/         34 images
- assets/             Brochure PDF, video
- README.txt          This file

TECH STACK
- Pure HTML / CSS / JavaScript — no build step, no framework
- Font Awesome 6 (CDN with SRI hash — tamper-proof)
- Google Fonts (CDN)
- Fully static — no backend, no database

HOSTING REQUIREMENTS
- Any standard web host that serves static files
- Works with: cPanel / Hostinger / GoDaddy / Namecheap / Bluehost
- Also works with: Netlify / Vercel / GitHub Pages / Cloudflare Pages
- No PHP, no Node.js, no database
- SSL / HTTPS recommended (free Let's Encrypt via cPanel)

UPLOAD STEPS (cPanel / shared hosting)
1. Log in to hosting control panel
2. Open File Manager, navigate to public_html/ (or www/ root)
3. Upload this ZIP, right-click, Extract
4. Make sure index.html sits at the root — not inside a subfolder
5. IMPORTANT: the .htaccess file (starts with a dot) may be hidden by
   default. Enable "Show Hidden Files" in File Manager settings before
   extracting, so .htaccess is visible and applied.
6. Visit yourdomain.com — site is live

AFTER SSL IS ACTIVE
Open .htaccess in a text editor, find the "Force HTTPS" block, and
uncomment the four lines (remove the # at the start). This redirects
all http:// visitors to https:// automatically.

SECURITY IN PLACE
- Content-Security-Policy meta tag blocks unauthorized scripts
- Subresource Integrity (SRI) on Font Awesome — tamper detection
- rel="noopener noreferrer" on all external links (anti tab-napping)
- .htaccess sets X-Content-Type-Options, X-Frame-Options, HSTS,
  Permissions-Policy, Referrer-Policy at the server level
- Form honeypot blocks most spam bots
- README.txt and dotfiles blocked from public access via .htaccess

WORKING FEATURES
- Enquiry + Contact forms → emails to Capsoftmd1611@gmail.com
- Phone / WhatsApp / Email quick-dial buttons
- Brochure PDF download
- Searchable + paginated ingredients table
- Auto-scrolling product marquee (pauses on hover)
- Scroll animations, 3D tilt cards, spring cursor

CONTACT FORM — ONE-TIME ACTIVATION
Forms go to FormSubmit (free, no signup). First submission after
go-live triggers a confirmation email to Capsoftmd1611@gmail.com.
Click the link once in that email — from then on, every submission
lands directly in the inbox.

CONTACT INFO SHOWN ON SITE
- Phones: +91-8091920250, +91-9991119367, +91-9896265464
- Email:  Capsoftmd1611@gmail.com
- Address: Shop no. 16, Ward no. 7, near Tulsidass Petrol Pump,
           Gharaunda, Haryana, India
- Update in both index.html and softgel.html if they change

BROWSER SUPPORT
- Chrome / Edge / Firefox / Safari (latest 2 versions)
- Mobile responsive down to 320px width

TOTAL SIZE
~20 MB (brochure PDF is 14 MB of that)
