# Interactive Classifier

The Gamera Interactive Classifier is deployed as a Rodan [Job Package](https://github.com/DDMAL/Rodan/wiki/Write-a-Rodan-job-package).

## Installation

- Follow the [rodan-docker guide](https://github.com/DDMAL/rodan-docker/blob/master/README.md) to set up Docker.
- Clone this Interactive Classifier repo inside `rodan-docker/jobs` using
  ``` 
  git clone --recurse-submodules https://github.com/DDMAL/Interactive-Classifier.git
  ```
  - If using an older version of `git` (pre-2.13) and the above command fails, instead run 
      ```
     git clone https://github.com/DDMAL/Interactive-Classifier.git
     git submodule update --init --recursive
     ```
  - If you already have an outdated version of this repository cloned, then pull all the changes and run
     ```
     git submodule update --init --recursive
     ```
- Open up `jobs/settings.py` in a text editor. Replace `demojob` with `interactive_classifier` to include the path to the Interactive Classifier folder in the Rodan Job Package registration. This should look something like the following
    ``` python
    RODAN_JOB_PACKAGES = (
      "rodan.jobs.interactive_classifier",
      # Paths to other jobs
    )
    ```
- Open `docker-compose.job-dev.yml` and replace the occurrence of `demojob` with 
  ```
  - ./jobs/Interactive-Classifier/rodan_job:/code/rodan/rodan/jobs/interactive_classifier
  ```
- The Interactive Classifier should now be available in any Rodan workflow.

## Running Rodan

Once the installation steps above are complete, run Rodan with the following command:
  ```
  docker-compose -f docker-compose.yml -f docker-compose.job-dev.yml up
  ```
  
To view the Rodan web interface, point your browser to [localhost:9002](localhost:9002), or [localhost:8000](localhost:8000) for the Rest API.

For instructions on how to use the Interactive Classifier in the Rodan workflow, please see the [wiki](https://github.com/DDMAL/Interactive-Classifier/wiki/Creating-an-Interactive-Classifier-Rodan-Workflow).


