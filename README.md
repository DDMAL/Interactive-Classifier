# Interactive Classifier

## Deployment Instructions

### Installing the Latest Version

The Gamera Interactive Classifier is deployed as a Rodan [Job Package](https://github.com/DDMAL/Rodan/wiki/Write-a-Rodan-job-package).

First, clone the Interactive Classifier repository inside `/path/to/rodan-docker/jobs/Interactive-Classifier`.

Open `/path/to/rodan-docker/docker-compose.job-dev.yml`. Under `volumes`, add the following link to the Interactive Classifier:  
`- ./jobs/Interactive-Classifier/rodan_job:/code/rodan/rodan/jobs/interactive_classifier`

Open `/path/to/rodan-docker/jobs/settings.py`. Remove `"rodan.jobs.interactive_classifier"` from the `RODAN_JOB_PACKAGES` tuple, if it exists.  Save `settings.py`. This will remove the built-in Interactive Classifier.

In the command line, go to `path/to/rodan-docker` and run 
````
docker-compose -f docker-compose.yml -f docker-compose.job-dev.yml up
````

Once Rodan finishes setting up, stop it by pressing `Ctrl + C`.

Open `/path/to/Rodan/rodan/settings.py`. Add `"rodan.jobs.interactive_classifier"` to the `RODAN_JOB_PACKAGES` tuple.
Save `settings.py` and run Rodan again. 

The Interactive Classifier in Rodan will be the latest version.

### Resetting to the Built-in Version

To remove the latest Interactive Classifier and use the built-in version, open `/path/to/rodan-docker/jobs/settings.py` and remove `"rodan.jobs.interactive_classifier"` from the `RODAN_JOB_PACKAGES`. 

Open `/path/to/rodan-docker/docker-compose.job-dev.yml`. Under `volumes`, remove  
`- ./jobs/Interactive-Classifier/rodan_job:/code/rodan/rodan/jobs/interactive_classifier`

In the command line, go to `path/to/rodan-docker` and run 
````
docker-compose -f docker-compose.yml -f docker-compose.job-dev.yml up
````
Open `/path/to/Rodan/rodan/settings.py`. Add `"rodan.jobs.interactive_classifier"` to the `RODAN_JOB_PACKAGES` tuple.
Save `settings.py` and run Rodan again. 

The Interactive Classifier in Rodan will be the built-in version.

### Running webpack:
Go in Interactive-Classifier/frontend
run:
````
npm install
npm install --save bootstrap jquery backbone backbone.radio backbone.marionette@2.4.7 minimatch tough-cookie
./node_modules/.bin/gulp
````
