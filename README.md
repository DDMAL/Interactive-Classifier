# Interactive Classifier

## Deployment Instructions

The Gamera Interactive Classifier is deployed as a Rodan Job Package.

First, create a symbolic link from `/path/to/Rodan/rodan/jobs/interactive-classifier/` to `/path/to/Interactive-Classifier/rodan_job/`.

Open `/path/to/Rodan/rodan/settings.py`.  Add `"rodan.jobs.interactive-classifier"` to the `RODAN_JOB_PACKAGES` tuple.  Save `settings.py`.

Finally, run `python manage.py migrate` in the Rodan virtual environment to activate the job package.
