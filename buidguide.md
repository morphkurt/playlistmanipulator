# Build guide for Demo Server

## Create the disk space

`mkdir /disk1`

## Build App Docker Image

```bash
docker build -t morphkurt/node-web-app https://raw.githubusercontent.com/morphkurt/playlistmanipulator/master/Dockerfile
```

```bash
docker pull nginx
docker run -d --restart always --name "nodejs" -p 3000:3000 morphkurt/node-web-app
docker run -d --restart always --name "web" -p 80:80 -v /disk1:/var/www/public -v /root/work/config/config/nginx.conf:/etc/nginx/nginx.conf --link nodejs:nodejs nginx
```
