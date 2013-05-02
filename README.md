# BlueCarbon
EcoPlotter application to analyse the data collected about blue carbon in the Abu Dhabi coastline

## Development Setup
You'll need to install the postgis extensions in the database before it will migrate, if your setup is like mine, you can do this by adding the postgis template to the database.yml:

    template: template_postgis

## Deployment
The app is deployed to a EC2 ubuntu instance. The deploy script is setup to deploy to a server named 'raster-stats', which you will need to add to your .ssh/config, like thus:

    Host raster-stats
    User <- server username ->
    HostName blue-carbon.unep-wcmc.org
    IdentityFile <- EC2 pem key location ->
