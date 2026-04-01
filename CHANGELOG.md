# Changelog

## [1.0.3](https://github.com/lemonadesocial/atlas-webapp/compare/v1.0.2...v1.0.3) (2026-04-01)


### Bug Fixes

* map Schema.org event format to flat AtlasEvent type ([56a1c93](https://github.com/lemonadesocial/atlas-webapp/commit/56a1c93f928b772b13a797b001d73fe182a6eadb))

## [1.0.2](https://github.com/lemonadesocial/atlas-webapp/compare/v1.0.1...v1.0.2) (2026-03-31)


### Bug Fixes

* bust Docker cache for updated build args ([214a14c](https://github.com/lemonadesocial/atlas-webapp/commit/214a14c41bcd8e870ef92a0feb6e8cedd80beba1))
* remove Docker registry cache to force full rebuild ([ac2907b](https://github.com/lemonadesocial/atlas-webapp/commit/ac2907bb4a56f06245441b4996689f67863f7951))

## [1.0.1](https://github.com/lemonadesocial/atlas-webapp/compare/v1.0.0...v1.0.1) (2026-03-31)


### Bug Fixes

* enable HTTPS and turbopack for local dev ([0c1318b](https://github.com/lemonadesocial/atlas-webapp/commit/0c1318b0baa55a5097756b861ec7ebd318570746))
* remove auth-callback test referencing deleted OAuth helpers ([e6579cd](https://github.com/lemonadesocial/atlas-webapp/commit/e6579cd6eb515c8daaaf35b83a156cc6dbb90d90))
* replace OAuth/Hydra flow with direct identity service redirect ([199d469](https://github.com/lemonadesocial/atlas-webapp/commit/199d469e979b22645fc5cce1dc0b3ad03745a98d))
* restore server-side logout route with Kratos session invalidation ([4c517d1](https://github.com/lemonadesocial/atlas-webapp/commit/4c517d17d05ac1c1980d1f52b51ce0ca2fb3ba1d))
* update .env.example with staging defaults for local dev ([82802e5](https://github.com/lemonadesocial/atlas-webapp/commit/82802e5ad82bfd950a9c4f793cf2d6106abafeac))
* use logout_token API call instead of redirecting to logout_url ([6708616](https://github.com/lemonadesocial/atlas-webapp/commit/6708616820b09a4ad339bb34c34d4e90d7c37875))
* use port 8001 for local dev to match Kratos allowed return URLs ([7a5c3e7](https://github.com/lemonadesocial/atlas-webapp/commit/7a5c3e7480913f1f85980f010594e61421f7dfe4))

## 1.0.0 (2026-03-31)


### Features

* add AI chat assistant with floating widget and dedicated page ([39f81c1](https://github.com/lemonadesocial/atlas-webapp/commit/39f81c154198c7ca30d0d17451d0e7b33d1ac1e0))
* add docs page, analytics tracking, and i18n prep ([3f88556](https://github.com/lemonadesocial/atlas-webapp/commit/3f88556ce4c31504f120ba88ea2c1edac7457ec0))
* add Phase 1 - landing page, event discovery, and purchase flow ([395f7d1](https://github.com/lemonadesocial/atlas-webapp/commit/395f7d1dee45a0000d690589e1f12b959ec1649d))
* add Phase 2 - organizer onboarding, leaderboard, and OAuth ([4e560ea](https://github.com/lemonadesocial/atlas-webapp/commit/4e560eae34c578b1463d509f32a3b3aa9f17ba4e))
* add release-please workflow ([eb59ee1](https://github.com/lemonadesocial/atlas-webapp/commit/eb59ee182ab94b134008aef55635032f3483c7fb))
* add staging and production deploy workflows ([c313c18](https://github.com/lemonadesocial/atlas-webapp/commit/c313c18c4bb28f333fa02fa9b6c0b44ed4f85345))


### Bug Fixes

* CI cross-platform dependency resolution ([74527e1](https://github.com/lemonadesocial/atlas-webapp/commit/74527e131082ec679962dfe4d046def2226121ab))
* CI pipeline - cross-platform deps and Next.js 15 async params ([e333056](https://github.com/lemonadesocial/atlas-webapp/commit/e333056d83af42fb22037421df14324afbb73c75))
* explicitly install lightningcss musl binary for Alpine Docker build ([631b367](https://github.com/lemonadesocial/atlas-webapp/commit/631b36732a277ae92355b67ed7ae5a0403f93680))
* rebuild lightningcss for Alpine musl in Docker build ([40c19d6](https://github.com/lemonadesocial/atlas-webapp/commit/40c19d6094fb73c9a16b59c88fc0ad730aba342a))
* regenerate lockfile for clean CI install ([fd3ea0a](https://github.com/lemonadesocial/atlas-webapp/commit/fd3ea0aab8a108efb3c80edece57e6b0016b9478))
* remove test for deleted chat proxy route ([49d3380](https://github.com/lemonadesocial/atlas-webapp/commit/49d3380eaf5320cd573697c128b6bea5d9388b5d))
* replace Vercel with Docker for self-hosted deployment ([81430cb](https://github.com/lemonadesocial/atlas-webapp/commit/81430cbf6e634068eb38a08703a049402225e72a))
* switch to node:20-slim to resolve lightningcss native binary mismatch ([86007d6](https://github.com/lemonadesocial/atlas-webapp/commit/86007d6921b50bcdccc070277d2933d0c313ea33))
* switch to yarn for Alpine-compatible dependency resolution ([c4279df](https://github.com/lemonadesocial/atlas-webapp/commit/c4279df165a0ea0f29dda9a1c8a8c5fa044e622b))
* update graphql-client tests for direct backend calls ([7629d75](https://github.com/lemonadesocial/atlas-webapp/commit/7629d75f4e50b60b4958283fada8abff52f8bc77))
* use getMe query instead of aiGetMe for user auth ([49bc0d2](https://github.com/lemonadesocial/atlas-webapp/commit/49bc0d2b952b96e49cf6fe727ba8d1d98b6dc896))
