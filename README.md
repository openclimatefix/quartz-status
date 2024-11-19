# Quartz Status API
___

## Overview
The Quartz Status API is a RESTful API that allows you to retrieve the status of the various internal components in the Quartz framework.

## API Docs
The Quartz Status API documentation can be found at [status.quartz.energy/docs](https://status.quartzz.energy/docs).

## Getting Started
### Installing

We use yarn as our package manager.

```bash
yarn install
```

### Setting Environment Variables

The environment variables in the `.env.example` file need to be populated.
Duplicate this file to create an `.env` in the root of this repo; there are no secret values in here, but they make it 
easier for configuring and keeping track of your local environment. This file will be .gitignored, so you can add your 
own values, but ensure you don't commit this file.

_N.B. Any admin routes with authentication will require server-side secret(s) to match the JWT token to be passed in the 
Authorization header. This auth is handled by Auth0, and requires extra credentials to be set up in the `.env` file 
which are only available to the OCF team, who can contact Brad for access to these extra credentials._


> In Production, these will come from the hosting environment and be injected into the Node.js app.

### Running the App

Now we are ready to run the app. 

```bash
## Runs the app in development mode, watching for changes
yarn dev
```

Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.

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
