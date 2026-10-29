# Measured mobile study time

The journey previously used the number of studied vocabulary words as study minutes. It now sums measured foreground learning seconds and displays complete minutes, using the Vietnam day boundary.

Mobile sends cumulative heartbeats every 15 seconds while a lesson, flashcard session or quiz is foregrounded. Navigation, backgrounding and sign-out stop that session. Repeated requests do not add the same seconds twice; the server caps a session by its elapsed wall-clock time. Old word counts are not converted to minutes. Time before measurement started cannot be reconstructed.

Deploy migration `20261029120000_measured_study_time` before the updated API. Both legacy and fresh Docker migration histories include it. Existing deployments can use their normal `docker/migrate.cjs` migration entry point. Reload the updated Expo app after updating the API. This change does not deploy to the server automatically.

Validation: mobile foreground/background regression; API 20 words vs 60 seconds regression and invalid heartbeat validation; mobile typecheck/tests, API tests/build and Android Hermes export.
