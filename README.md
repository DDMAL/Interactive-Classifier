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
  
To view the Rodan web interface, point your browser to http://localhost:9002, or http://localhost:8000 for the Rest API.

For instructions on how to use the Interactive Classifier in the Rodan workflow, please see the [wiki](https://github.com/DDMAL/Interactive-Classifier/wiki/Creating-an-Interactive-Classifier-Rodan-Workflow).

##developing 2021 - building on IC

To begin. you will need cd into the `forntend` folder in the IC and install nvm.

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Once installed, check the version using `nvm --version` to make sure it worked. After, you need to check the version of node `node --version`. If the version is not already `8.9.0`, then you will need to change versions using

```
npm install node@8.9.0
```
Finally, after checking the version of node, you will install the proper version of node-sass

```
npm install node-sass@4.14.1
```

and then do `yarn build` to build the IC.
