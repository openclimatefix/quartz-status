# Quartz Status API
___

## Overview
The Quartz Status API is a RESTful API that allows you to retrieve the status of the various internal components in the Quartz framework.

## API Endpoints
The Quartz Status API has the following endpoints:

- `/health` - Returns the health of the Quartz Status API
- `/health/all` - Returns the overall health of the Quartz framework
- `/components/airflow` - Returns the health of the Airflow instance
- `/components/apis/uk-pv-api/health` - Returns the health of the UK PV API
- `/components/apis/uk-pv-api/last_forecast_run` - Returns the last time the forecast was run
- `/components/apis/uk-sites-api` - Returns the health of the UK Sites API
- `/components/apis/uk-sites-api/last_forecast_run` - Returns the last time the forecast was run
- `/components/consumers` - Returns the health of the OCF consumers
- `/components/consumers/gsp` - Returns the health of the GSP consumer
- `/components/consumers/pv` - Returns the health of the PV consumer
- `/components/consumers/nwp` - Returns the health of the NWP consumer
- `/components/consumers/national-nwp` - Returns the health of the National NWP consumer
- `/components/consumers/national-satellite` - Returns the health of the National Satellite consumer
- `/components/models/pv-net-2` - Returns the health of the PV Net 2 model
- `/components/models/pv-net-2/last-run` - Returns the last time the model was run

## Getting Started
### Installing

We use yarn as our package manager.

```bash
yarn install
```

### Setting Environment Variables

The following environment variables need to be populated.
Create a file `.env` in the root of this app folder; this will be .gitignored, so you can add your own values but ensure you do not commit this file.

```bash
# .env
PORT=3000
```

> In Production, these will come from the hosting environment and be injected into the Node.js app.

### Running the App

Now we are ready to run the app. 

```bash
## Runs the app in development mode, watching for changes
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

TBC

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
