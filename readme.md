# grpc-memory-leak

This uses a test run against the Datastore API, so Google authentication is required.

```sh
$ gcloud auth login
$ export GCLOUD_PROJECT={YOUR_PROJECT_ID}
$ npm test

// ... observe output (run time should be around 3 minutes) ...
```
