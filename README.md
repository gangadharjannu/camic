# Camic - Test your camera and microphone online

## Clone the application

Clone the comic repository

```bash
git clone https://github.com/gangadharjannu/camic.git
```

## Development

Since this application has service worker, you will need https to test the functionality properly in local.

So you can use http-server with user generated certificates like below

```
http-server -S -C ./localhost.pem -K ./localhost-key.pem
```

or you can use the webpack which is already configured in package.json

## Source code

https://github.com/gangadharjannu/camic.git

## See the demo

[github pages](https://gangadharjannu.github.io/camic)

[netlify](https://camic.netlify.app)
