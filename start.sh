#!/bin/bash

# Log and run apt update
echo "Running apt update"
apt update -y

# Log and install iputils-ping
echo "Installing iputils-ping"
apt install iputils-ping -y

# Log and start the application using pm2
echo "Starting the application with pm2"
pm2 start build/index.js

# Log and list pm2 processes
echo "Listing pm2 processes"
pm2 list

while true; do
    sleep 1
done
