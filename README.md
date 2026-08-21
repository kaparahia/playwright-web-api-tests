# Playwright + Page Object Model + API Layer — SauceDemo & FakeStoreAPI

Automation project built with **Playwright + TypeScript**, using the
**Page Object Model (POM)** pattern for the UI and a similar **API-client layer**
for API tests.

- **UI under test:** [saucedemo.com](https://www.saucedemo.com) — a popular
  demo website for practicing UI automation (login → catalog → cart → checkout).
- **API under test:** [fakestoreapi.com](https://fakestoreapi.com) — a public
  REST API with products, categories, and authentication that is frequently used
  for practicing API testing.

## Project structure

```
playwright-saucedemo-pom/
├── pages/                       # UI page objects
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── api/                         # API layer (similar to pages/, but for APIs)
│   ├── clients/
│   │   ├── BaseApiClient.ts     # shared logic (HTTP methods, timing)
│   │   └── FakeStoreApiClient.ts# endpoint-specific methods
│   └── types/
│       └── product.types.ts     # TypeScript types for API responses
├── fixtures/
│   └── fixtures.ts              # test.extend: page objects + apiClient
├── utils/
│   ├── test-data.ts             # UI test data (users, products)
│   └── schema-validators.ts     # reusable API-response schema validations
├── tests/
│   ├── login.spec.ts            # UI
│   ├── inventory.spec.ts        # UI
│   ├── cart.spec.ts             # UI
│   ├── checkout.spec.ts         # UI
│   ├── api/                     # API-only tests (no browser)
│   │   ├── products.api.spec.ts
│   │   ├── auth.api.spec.ts
│   │   ├── products-crud.api.spec.ts
│   │   └── full-verification.api.spec.ts
│   └── combined/
│       └── api-driven-cart.spec.ts   # a test combining API and UI
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

The project is easy to extend:

- New UI page → add a class in `pages/` and register it in `fixtures/fixtures.ts`
- New API → add a class in `api/clients/` and register it in `fixtures/fixtures.ts`

## Installation

```bash
npm install
npx playwright install --with-deps
```

## Running tests

```bash
npm test                 # all tests (UI in four profiles + API in a separate project)
npm run test:headed      # UI with a visible browser
npm run test:ui          # Playwright interactive UI mode
npm run test:api         # API tests only (no browser; fast)
npm run test:combined    # combined UI + API test only
npm run report           # open the latest HTML report
```

API tests run in a separate Playwright project (`--project=api`) with their own
`testDir`, so they are **not** multiplied across browser profiles. In contrast,
UI and combined tests require a browser.

## What the tests demonstrate

### UI (Page Object Model)

- `page.goto`, `locator.click/fill/selectOption`, and navigation waits
- `toBeVisible/toBeHidden`, `toHaveText/toContainText`, `toHaveURL`,
  `toHaveCount`, and `toHaveAttribute`
- `beforeEach` for state preparation (login and cart setup)

### API (API layer + full response verification)

The project checks more than a status code. A typical set of API-request checks includes:

- **Status code and status text** (`response.status()`, `response.statusText()`)
- **Response headers** (`Content-Type`, and so on)
- **JSON validity** (the body parses without errors)
- **Response schema** — all fields are present and have the correct types
  (`utils/schema-validators.ts`)
- **Data business constraints** — price > 0, rating between 0 and 5, and an integer id
- **Correct values** for a specific request, rather than merely receiving some response
- **Cross-endpoint consistency** — a product from the list matches the product details
- **Query parameters** — `limit` and `sort` actually affect the result
- **Negative scenarios** — nonexistent id and invalid login credentials
- **CRUD** — POST/PUT/PATCH/DELETE and echoing submitted data in the response
- **Response time** — a simple performance check (`durationMs < 3000`)

`tests/api/full-verification.api.spec.ts` combines these points into one example
test, serving as a checklist of what is usually checked for a single request.

### Combined UI + API test

`tests/combined/api-driven-cart.spec.ts` is a test that uses both `apiClient`
(a fixture based on `request`) and page objects (`page`). Data obtained from the
API determines the number of UI-scenario steps, and the result is then verified
in the UI. The file explains why two independent public services are combined
here (an educational demonstration of the technique) and how this pattern would
look in a real project, where the API and UI belong to one system.

### Organizational practices

- Page Object Model for the UI plus a similar API layer (`api/clients/`)
- Fixtures (`test.extend`) for automatic injection of both page objects and the API client
- A separate Playwright project for API tests, avoiding unnecessary browser runs
- Extracted test data and schema validators for reuse across tests
- Screenshots, video, and traces only when a UI test fails
