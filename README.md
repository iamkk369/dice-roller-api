# Dice Roller API

I built this project to practise working with a small serverless API and connecting it to a browser-based dashboard. The backend rolls dice and returns the results as JSON. The dashboard provides the controls and displays the results, statistics, and roll history.

**Repository:** [iamkk369/dice-roller-api](https://github.com/iamkk369/dice-roller-api)  
**License:** MIT

## What it does

### API

The API exposes one route:

`GET /roll`

It accepts two optional query parameters:

- `sides`: number of sides on the die. Defaults to `6`; supported values are integers from `2` to `100`.
- `count`: number of rolls. Defaults to `1`; the API returns at most `10` rolls per request.

The Lambda handler uses Node.js `crypto.randomInt()` to generate the rolls. A successful response includes the die sides, number of rolls, individual results, and their total. Invalid side values or non-positive/non-integer counts return HTTP `400`.

Example request:

```text
GET /roll?sides=20&count=2
```

Example response (the numbers will vary between requests):

```json
{
  "sides": 20,
  "count": 2,
  "rolls": [7, 19],
  "total": 26
}
```

### Dashboard

The frontend is in `frontend/index.html`. It currently includes:

- D4, D6, D8, D10, D12, D20, and D100 dice options, with animated dice visuals.
- Roll quantity and modifier controls.
- Several dice colour themes and a sound toggle.
- D20 natural 20 / natural 1 indicators.
- Result totals, average, minimum/maximum values, and a distribution chart.
- In-memory roll history and CSV export.
- A request/response view, a browser-side activity panel, and architecture/developer information dialogs.

Some dashboard features are calculated in the browser. In particular, the modifier and dashboard statistics are not calculated by the Lambda API. The activity panel is a UI display, not a live CloudWatch log viewer.

The dashboard has options for a configured API endpoint, a local SAM API, and local simulation. Simulation must be selected explicitly; API or network errors are shown rather than silently treated as successful API responses.

## How it is put together

```text
Browser dashboard
       |
       | GET /roll
       v
Amazon API Gateway
       |
       v
AWS Lambda (Node.js)
       |
       v
JSON response
```

The AWS resources and `GET /roll` route are described in `template.yaml`. `samconfig.toml` contains SAM deployment defaults. The Lambda handler is in `lambda/index.mjs`, and the tests are in `tests/handler.test.mjs`.

## Project structure

```text
dice-roller-api/
├── assets/
│   └── dashboard-preview.png
├── frontend/
│   └── index.html
├── lambda/
│   └── index.mjs
├── tests/
│   └── handler.test.mjs
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── samconfig.toml
└── template.yaml
```

## Run it locally

### Requirements

- Node.js 24.x
- AWS CLI v2
- AWS SAM CLI
- Docker Desktop for running the Lambda locally with SAM
- An AWS account and appropriate permissions if you want to deploy it

### 1. Clone the repository

```powershell
git clone https://github.com/iamkk369/dice-roller-api.git
Set-Location dice-roller-api
```

### 2. Run the tests

The tests use Node.js's built-in test runner, so no additional test package is needed:

```powershell
node --test tests/handler.test.mjs
```

### 3. Validate and build with SAM

```powershell
sam validate
sam build
```

### 4. Start the local API

Make sure Docker is running, then run:

```powershell
sam local start-api
```

The local API should be available at `http://127.0.0.1:3000`. Try it from another terminal:

```powershell
curl.exe "http://127.0.0.1:3000/roll?sides=20&count=2"
```

### 5. Open the dashboard

Open `frontend/index.html` in your browser, or use the VS Code Live Server extension. In the dashboard, select **Local SAM API** while the local API is running. You can also select local simulation to try the dashboard without making an API request.

To use a deployed API, select the production option only after `API_ENDPOINTS.prod` in `frontend/index.html` has been set to the correct endpoint.

## Deploy to AWS

Configure your AWS CLI credentials/profile first, then run this from the project root:

```powershell
sam deploy --guided
```

Follow the prompts and review the proposed changes before confirming deployment. After a successful deployment, use the API endpoint printed by SAM. The exact URL depends on your AWS deployment, so it should not be assumed from this README.

Do not put AWS access keys or other secrets in the repository. The `.env.example` file is only a reference; it does not configure AWS credentials automatically. Use an AWS CLI profile or another supported credential method.

## Notes and limitations

- The API currently has no authentication.
- The handler allows cross-origin requests from any origin (`Access-Control-Allow-Origin: *`). This is convenient for a public demo, but should be reviewed before production use.
- Before exposing the API to wider use, consider authentication, request throttling/usage controls, and a more restrictive CORS policy.
- The dashboard's roll history is held in browser memory; it is not a persistent database.

## Author

**Khilankumar Rajput**  
GitHub: [@iamkk369](https://github.com/iamkk369)  
LinkedIn: [Khilankumar Rajput](https://www.linkedin.com/in/khilankumar-r-490369329)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
