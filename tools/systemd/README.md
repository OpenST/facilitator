# Running facilitator as systemd service

## Create facilitator_{token}.service file under /etc/systemd/system/

token here is token identifier. Facilitator service file will look like below: 
e.g. facilitator_ost.service
     facilitator_weth.service
```
[Unit]
Description=Facilitator service for <token>
After=network.target

[Service]
# Machine user
User=root

# Service will switch to this directory before starting facilitator
WorkingDirectory=/root/facilitator
# Start facilitator
ExecStart=./facilitator start --facilitator-config <facilitator-config-path> --mosaic-config <mosaic-config-path>

# Restart when facilitator is crashed
Restart=on-failure
# Restart service after 5 seconds if node service crashes
RestartSec=5

# Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=facilitator_{token}

[Install]
WantedBy=multi-user.target

```

## Enable facilitator service

```
sudo systemctl daemon-reload
sudo systemctl enable facilitator_{token}
```

## Start facilitator service

```
sudo systemctl start facilitator_{token}
```

## Verify facilitator is running 

```
systemctl status facilitator_{token}.service
```

## Monitor logs

```
tail -f /var/log/syslog
```