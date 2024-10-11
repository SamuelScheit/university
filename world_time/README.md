# World time

A [gRPC](https://grpc.io/) project to query the time in different time zones.

Check it out on https://time.samuelscheit.com/

<a href="https://time.samuelscheit.com/"><img width="1623" alt="image" src="https://user-images.githubusercontent.com/34555296/236493154-6c9e7379-4f91-4f78-94af-ce077c6dda2f.png"></a>

## Architecture

The project consists of two services:

-   **Timezone Server**: A gRPC typescript server that returns the current time in a given timezone.
-   **Timezone Client**: A React web app that allows the user to query the Timezone Server for the current time in a given timezone.

The user can click on the map or use the drop-down menu to query the time of any time zone on Earth.

## Running the project

You must have [Docker](https://docs.docker.com/get-docker/) installed on your machine to run the project.

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
