# World Time

An example gRPC project to display the current time in different timezones.

<img width="1623" alt="image" src="https://user-images.githubusercontent.com/34555296/236493154-6c9e7379-4f91-4f78-94af-ce077c6dda2f.png">


## Architecture

The project consists of two services:

-   **Timezone Server**: A gRPC server that returns the current time in a given timezone.
-   **Timezone Client**: A Web UI that allows the user to query the Timezone Server for the current time in a given timezone.

## Running the project

You need to have [Docker](https://docs.docker.com/get-docker/) installed on your machine to run the project.

### Steps

1. Clone the repository:

```bash
git clone https://github.com/samuelscheit/uni
cd uni/world_time
```

2. Start the project:

```bash
./start.sh
```
