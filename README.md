# Onsite-demo

Onsite repository to show an implementation example for Onsite-API widget response.

## Dependencies

- Docker
- Docker-compose
  
## Commands

- `make build`: Build docker image.
- `make start`: Start the docker containers.
- `make stop`: Stop the docker containers.
- `make logs`: Show logs of webpack-dev-server for debug purposes.
- `make bash`: Enter on container bash for container debug purposes.

## How to use

- Run `make build` -> `make start` -> (optionally) `make logs`
- Turn on CORS plugin on your browser. **Obs:** Remember to turn off, otherwise you will have problems in google services and github.
- Access `localhost:9000` and fill the info to get the answer.

## Tips

- Pass the infos via url parameters. Ex: `http://localhost:9000/?apiKey=<sampe-v5>&secretKey=<1234>&name=<home>&source=<desktop>&deviceId=<test>`.
- Check the autoplay toggle for carousels autoplay.
- The JSON from api response is in the end of the page.
