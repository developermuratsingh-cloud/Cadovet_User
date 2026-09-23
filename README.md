# Cado Vet – mobile app

Customer app for the Cado Vet veterinary platform. Expo SDK 57 · React Native · TypeScript · Expo Router ·
Redux Toolkit + RTK Query · i18next (English / Hindi) · light / dark theme, styled to match the Cado Vet website.

The backend (`../cado_vet/cadovet-server`) is the single source of truth. The app contains no mock business data.

## Run

```bash
# 1. backend (port 5001) – needs PostgreSQL; apply the migrations once:
psql -d cadovet -f ../cado_vet/cadovet-server/src/database/migrate_mobile.sql
psql -d cadovet -f ../cado_vet/cadovet-server/src/database/migrate_otp.sql
cd ../cado_vet/cadovet-server && npm start

# 2. app
npm install
npx expo start
```

In development the API host is taken from the Expo dev server, so a physical device on the same Wi-Fi works
without configuration. Override with `EXPO_PUBLIC_API_URL` (see `.env.example`) for other networks or
production. Android emulator: `http://10.0.2.2:5001/api`.

## Test credentials

There are no passwords: sign in with a mobile number and a 6-digit code. For local testing the backend accepts one fixed code
for a list of test numbers, so no SMS provider is needed. **Code for every number below: `123456`** (country **+91 India**).

| Use it to | Mobile | Account |
|---|---|---|
| Sign in with existing data | `9876543213` | Rahul Verma — 2 pets, 2 appointments |
| Sign in with existing data | `9876543214` | Sarah Jenkins — 2 pets, 1 appointment |
| Test **sign up** (numbers are unused) | `9000000001` … `9000000005` | Enter any name; email and referral code are optional |
| Test **delete account** | a `900000000x` number you signed up | Menu → Delete account → Send code → `123456`. Don't delete Rahul or Sarah: it anonymises them for good |
| Work the **admin panel** (website `/login` → *Staff* tab) | `ops@cadovet.com` / `staff123` (operational head) · `doctor@cadovet.com` / `doctor123` · `admin@cadovet.com` / `admin123` | Staff sign in with **email + password** (not OTP). See `../cado_vet/README.md` for who sees what |

Steps: open the app → enter the number → **Send OTP** → enter `123456` → **Verify**.
A number that has no account shows "No account found" on Sign in; a number that already has one shows "already exists" on Sign up.
Deleting an account anonymises it and frees the number, so a `900000000x` number can be signed up again afterwards.

How it works and where it is switched on — backend `cadovet-server/.env` (template in `.env.example`):

```
OTP_TEST_CODE=123456
OTP_TEST_MOBILES=9876543213,9876543214,9000000001,9000000002,9000000003,9000000004,9000000005
```

The fixed code applies **only** to the numbers listed in `OTP_TEST_MOBILES`; every other number gets a random code (printed in
the backend console as `[otp] (SMS not configured) code for …` while no SMS provider is set). It is ignored — with a warning in
the log — when `NODE_ENV=production` or when a real SMS provider (Twilio) is configured, so it cannot leak into a live setup.
Staff accounts are never covered by the fixed code (they use email + password). Never put real people's numbers in `OTP_TEST_MOBILES`; the seeded numbers are dev data only.

### Booking is a request

The app lets the customer choose **service → pet → date and time** (times come from the clinic's availability). There is no doctor
step: the request is sent `PENDING`, the **operational head assigns a doctor**, and the appointment turns **Confirmed** with the
doctor's name. Until then it shows as *Awaiting confirmation* / *Doctor to be assigned*. Rescheduling a confirmed visit sends it back
for confirmation. Details in [`../cado_vet/README.md`](../cado_vet/README.md) (*Clinic workflow*).

### How this app connects to the rest of the system

The app, the website (`cadovet-client`), the admin portal (the same React app under `/admin`) and the backend
(`cadovet-server`) share one API and one customer identity: a customer registered here can sign in on the website with the same
mobile number and OTP, a website guest booking shows up in the app once the guest signs in, and everything staff do in the portal
is what the customer sees here. The full picture, the backend test suite (`npm test`), the real-browser end-to-end run
(`npm run e2e`) and a production checklist are in [`../cado_vet/README.md`](../cado_vet/README.md).

`npm run typecheck` runs the TypeScript check; `npm test` runs the validation, search and date tests.

## Architecture

```
src/
├── app/                     Expo Router routes – thin re-exports of screens; auth guard via Stack.Protected
├── core/                    config (API URL, languages), normalised ApiError
├── domain/
│   ├── entities/            plain TS types (Pet, Appointment, Doctor, …)
│   └── usecases/            pure client logic (booking draft, upcoming/past, validation, dates)
├── data/
│   ├── api/                 RTK Query: baseApi (auth header, single-flight token refresh, error mapping) + endpoints
│   ├── dto/  mappers/       backend snake_case / numeric strings  →  domain entities
│   └── storage/             secureStorage (Keychain/Keystore via expo-secure-store)
└── presentation/
    ├── state/               store, rootReducer, slices, selectors, typed hooks, listeners, session thunks
    ├── components/          reusable UI (Screen, Button, TextField, Card, AsyncBoundary, …)
    ├── screens/             feature screens
    ├── theme/  i18n/  hooks/  utils/
```

State ownership

| Kind | Where |
| --- | --- |
| Server data (services, doctors, pets, appointments, records, invoices, current user) | RTK Query |
| Session tokens | `auth` slice in memory + `expo-secure-store` on disk (synced by a listener) |
| Theme mode, language | Redux slices, persisted with redux-persist (only these two slices) |
| Booking wizard draft | `booking` slice |
| Online status, init flag | `app` slice |
| Form fields, modals, one-screen UI | React local state |

Deliberate deviations from the generic spec: there is no `userSlice` (the profile lives in the RTK Query
`getMe` cache and is read via `selectCurrentUser` / `selectPermissions`, so it is never duplicated) and no
`cartSlice` / `orderSlice` (the backend has no cart/order/product APIs and the app is customer-scope only).
Login/signup loading and error state come from the RTK Query mutation state instead of `authSlice`.

## Side menu, search & blog

- **Side menu** (hamburger on Home, Appointments, My pets and Profile; swipe left or tap outside to close). Items, in order:
  My pets · Appointment · Medical Records · Vaccination · Refer · Coupon · Membership offer · Need Help · Contact Support ·
  Privacy Policy · Delete account (kept last).
  Open/closed state lives in the `app` slice; the menu is mounted once in the root layout.
- **Home**: search bar filtering services (name, category, description; tap a result to start booking), then hero, stats,
  services, next appointment, doctors and a **Blog** section at the bottom. "My pets" and "Shortcuts" were removed from Home;
  invoices moved to Profile → My invoices.
- **Vaccination**: each pet's status (profile flag + last completed / next upcoming vaccination visit) and a list of
  vaccination services to book. **Need Help**: FAQ. **Contact Support**: WhatsApp / call / email plus a validated message form.
- **Blog** uses a new backend API (`GET /api/blogs`, `GET /api/blogs/:slug`, public), seeded with the website's 7 articles
  (`migrate_blog.sql`).
- **Delete account** (`POST /api/auth/me/otp` sends a code to the account's mobile, then `DELETE /api/auth/me` with `{code}`): anonymises rather than removes — name, email/mobile and address
  are erased, upcoming appointments cancelled, pets deactivated, sessions revoked and sign-in blocked. Invoices and medical records
  are kept without personal details. Staff accounts cannot use it.

## Medical Records hub, documents, coupons, referral & membership

- **Medical Records** opens a hub with four entries — **Prescription**, **Lab Reports**, **Vaccinations**, **Upload document** —
  each with a live count, above the visit history. Prescription = prescriptions from your visits (backend) plus any you upload;
  Lab Reports and Vaccinations (certificates) = your uploaded documents; Upload document = a validated form (PDF/JPG/PNG/WEBP/HEIC,
  ≤ 10 MB; choose file, camera or photo library; optional pet and notes) plus your document list with view/delete.
- Documents are stored by the backend per customer (`documents` table, files under `cadovet-server/uploads/documents/`, random
  names, 10 MB / type limits enforced server-side). Files open through a 5-minute signed link, so no auth header is needed by the
  system viewer. Deleting an account erases the customer's documents.
- **Uploads use `XMLHttpRequest`, not `fetch`**: Expo SDK 57's global `fetch` only accepts `Blob`/`File` parts and cannot read the
  picker's cache files in Expo Go, so `documentApi.uploadDocument` posts the multipart form via XHR (works natively and on web).
- **Coupon** lists the backend's active coupons (seeded with the website's `WELCOME10` and `CADO10`, 10% off) with copy and
  "Use on booking". The booking review step applies a coupon via `POST /api/coupons/validate`; the server prices the service and
  computes the discount (never the client) and records `coupon_code` / `discount_amount` on the appointment.
- **Refer** gives each user a personal code (`GET /api/referrals/me`), a copy/share sheet and a "friends joined" count. Signup accepts
  an optional referral code; a referred friend gets the existing `WELCOME10` coupon. No reward amount is promised to the referrer.
- **Membership offer** shows the website's discounted health packages (13, seeded from `cadovetCatalog.js` into `membership_offers`)
  with price, original price, savings and inclusions; "Enquire on WhatsApp" pre-fills the package.
- Backend migration for all of this: `migrate_records_offers.sql` (needs `npm install` in `cadovet-server` for `multer`).

## Design (matches the website)

Tokens come from `cadovet-client/src/index.css` (`presentation/theme/tokens.ts`): teal `#1BAFBF`, brand green `#4CAF50`,
lime `#84CC16` (the "VET" wordmark / progress bar), WhatsApp green `#25D366`, Poppins typeface, pill buttons,
24px-radius cards with teal-tinted shadows, the CADOVET logo, the 24×7 emergency strip and the teal hero card with a
paw watermark. Light/dark themes and English/Hindi are switchable in Profile.

## WhatsApp & support

- Floating WhatsApp button on every tab (same number and prefilled message as the website: `wa.me/919220410777`),
  personalised with the signed-in user's name.
- Appointment detail: "Chat on WhatsApp" pre-fills the appointment date, time and pet.
- Profile → Help & support: WhatsApp, call the helpline, email `care@cadovet.com`.
- The emergency strip on Home and the auth screens dials the helpline. Contact details live in `core/config/contact.ts`.

## Validation

Rules are pure functions in `domain/usecases/validation.ts` (tested in `tests/`), surfaced by the `useForm` hook
(errors show after a field is blurred or on submit) and translated per language:
mobile number (validated against the selected country's numbering plan by `libphonenumber-js`), optional email format,
name (unicode letters incl. Devanagari, 2–60), pet date of birth (masked `YYYY-MM-DD`, real date, not in the
future), weight 0.1–200 kg, 6-digit PIN code, and length limits with character counters.
The backend re-validates signup, pets and appointment dates (no past dates), so the rules cannot be bypassed.

## Sign in with OTP (no passwords)

Customers have no password. **Sign in**: mobile number → 6-digit code by SMS → signed in. **Sign up**: name + mobile (required)
+ email (optional) + referral code → code → account created and signed in. The mobile field has a country-code button with a
searchable list (`libphonenumber-js` for calling codes and validation, `i18n-iso-countries` for names; India +91 is preselected).
Backend: `POST /api/auth/otp/send` (`{mobile, purpose: 'login'|'signup', email?}`), `POST /api/auth/otp/login` and
`POST /api/auth/otp/signup` (both return the same `{token, refreshToken, user}` as the password login), table `otp_codes`
(`migrate_otp.sql`). Accounts created this way get a random unusable password hash, so they can only be entered with a code.
The website and staff accounts keep using `POST /api/auth/login` with a password, and the old reset endpoints are unchanged.
Mobile numbers are stored as the server has always stored them: the plain 10-digit number for India, `+<country><number>` for
every other country (`toServerMobile` in `domain/usecases/validation.ts`).
The code is 6 digits, stored only as a keyed hash, valid 10 minutes, single use, locked after 5 wrong attempts, and limited to
5 requests per hour per number and purpose. Signing in with an unregistered number answers 404 (the sign-up endpoint already
reveals which numbers exist), so the app can point the user to Sign up.

**Delivery**: the codes go by **SMS** (Twilio); the password-reset endpoints can also use **email** (any SMTP provider).
Both are optional and configured in `cadovet-server/.env` (see `.env.example`):

```
SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM          # email
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM | TWILIO_MESSAGING_SERVICE_SID, SMS_DEFAULT_COUNTRY_CODE=91   # SMS
```

Without a provider the code is printed in the backend console instead (`[otp] (SMS not configured) code for …`).
Sending happens in the background, so provider latency or outages never change the API reply and cannot reveal which accounts
exist; failures are logged as `[password-reset] delivery via … failed`. 10-digit numbers get `SMS_DEFAULT_COUNTRY_CODE`
(default 91) prepended; numbers starting with `+` are used as is. To use another SMS vendor (e.g. MSG91) add a function next to
`sendViaTwilio` in `src/utils/notify.js`. `RESET_CODE_IN_RESPONSE=true` echoes the code in the API response for local testing only —
never enable it in production. Note: SMS to Indian numbers usually needs DLT registration of the sender ID and message template with the provider.

## Auth flow

OTP login/sign-up → `{token, refreshToken}` → secure storage + `auth` slice → `Authorization: Bearer` on every request.
A 401 triggers one shared `POST /auth/refresh` (the server rotates refresh tokens), then the request is retried.
If the refresh is rejected the session, secure storage and the API cache are cleared and the router returns to Login;
a network failure during refresh does **not** log the user out.

## Backend additions made for the app (cadovet-server)

- `POST /auth/refresh`, refresh tokens on login, `POST /auth/logout` revokes them (`migrate_mobile.sql`)
- `PATCH /auth/me` (name, address) and address fields on `GET /auth/me`
- `GET /appointments/availability`, slot-conflict check (409) on create
- `PATCH /appointments/:id/cancel` and `/reschedule` for customers (ownership enforced)
- Ownership checks on `GET /appointments/:id`, `/invoices/:id`, `/medical-records/:id`; fixed the `p.dob` column bug
- DATE columns are now returned as `YYYY-MM-DD` (previously shifted a day back in UTC)

## Known limits

- The backend has no products, packages, cart, orders, payments, push tokens or image upload.
- `PUT /pets/:id` uses COALESCE, so numeric/date fields cannot be cleared once set.
- Older customer accounts that only have an email (no mobile number) cannot sign in from the app, since sign-in is by mobile OTP.
