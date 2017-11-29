echo "DEPLOY_STATUS=1" > ./startnow/deploy.py
appcfg.py -A fresh-buffer-128211 update app.yaml
echo "import grequests;DEPLOY_STATUS=0" > ./startnow/deploy.py
