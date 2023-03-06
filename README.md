# stategy-ai-employees
This houses the stategy ai empployees chatbots that connect to OpenAi


## Build a Docker image for a basic HTTP server

1.  Create a new directory and navigate to it:
    
```bash
mkdir my-http-server
cd my-http-server
```
    
2.  Create a file called `Dockerfile` in the directory with the following content:
    
```bash
FROM httpd:latest

COPY . /usr/local/apache2/htdocs/
```
    
    This Dockerfile uses the `httpd` base image to create a new image, copies the contents of the current directory to the `/usr/local/apache2/htdocs` directory in the container, and runs the HTTP server on port 80.
    
3.  Build the Docker image using the `docker build` command:
    
```bash
docker build -t my-http-server .
```
    
    This command builds the Docker image with the tag `my-http-server` using the Dockerfile in the current directory (`.`).
    

## Start a Docker container from the Docker image

1.  Start a Docker container from the image using the `docker run` command:
    
```bash
docker run -p 8981:80 my-http-server
```
    
    This command starts a new Docker container from the `my-http-server` image and maps the container's port 80 to port 8981 on the local machine.
    
2.  Access the HTTP server by visiting `http://localhost:8981` in a web browser.
    

## Update the Dockerfile to set the `ServerName` directive

1.  Open the `Dockerfile` in a text editor and add the following line at the top of the file:
    
```bash
RUN echo "ServerName ai-chatbot.stategy.ca" >> /usr/local/apache2/conf/httpd.conf
```
    
    This line sets the `ServerName` directive for Apache to `ai-chatbot.stategy.ca`.
    
2.  Save the file and exit the text editor.
    

## Rebuild the Docker image with the updated configuration

1.  Rebuild the Docker image using the `docker build` command:
    
    perlCopy code
    
```bash
docker build -t my-http-server .
```
    
    This command rebuilds the Docker image with the updated configuration.
    

## Start a new Docker container from the updated Docker image

1.  Start a new Docker container from the updated Docker image using the `docker run` command:
    
```bash
docker run -p 8981:80 my-http-server
```
    
    This command starts a new Docker container from the `my-http-server` image with the updated configuration and maps the container's port 80 to port 8981 on the local machine.
    
2.  Access the HTTP server by visiting `http://localhost:8981` in a web browser.
    

## Replace an SVG image in a web page

1.  Determine the dimensions of the original SVG image by looking at its `width` and `height` attributes or by opening the file in a vector graphics editor.
    
2.  Replace the original SVG file with the new SVG file, making sure that the new file has the same dimensions as the original file.
    
3.  Update the HTML code for the web page to reference the new SVG file. If necessary, adjust the `width` and `height` attributes of the `svg` element and any other styling or scripting that is specific to the SVG file.
    
4.  Save the updated HTML file and refresh the web page in a browser to verify that the new SVG image is displayed correctly.

Note: 
Characters are 2382px by 3202px 
Header logo is 111px by 20px


## Build a new Docker image with a different tag

1.  Rebuild the Docker image with a new tag using the `docker build` command:
    
```bash
docker build -t stategy-ai-chatbot:v0.
```
