# Interactive Classifier

## Deployment Instructions

The Gamera Interactive Classifier is deployed as a Rodan [Job Package](https://github.com/DDMAL/Rodan/wiki/Write-a-Rodan-job-package).

First, clone the Interactive Classifier repository inside `/path/to/rodan-docker/jobs/Interactive-Classifier`.

In `docker-compose.job-dev.yml`, under `volumes`, add the following link to the Interactive Classifier:
````
- ./jobs/Interactive-Classifier/rodan_job:/code/rodan/rodan/jobs/interactive_classifier
````

Open `/path/to/Rodan/rodan/settings.py`.  Add `"rodan.jobs.interactive_classifier"` to the `RODAN_JOB_PACKAGES` tuple.  Save `settings.py`.

Finally, run `python manage.py migrate` in the Rodan virtual environment to activate the job package.

### Running webpack:
Go in Interactive-Classifier/frontend
run:
````
npm install
npm install --save bootstrap jquery backbone backbone.radio backbone.marionette@2.4.7 minimatch tough-cookie
./node_modules/.bin/gulp
````
