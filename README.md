# Ulegalize Lawfirm
## Getting started
First you can read the accessible documentation  
https://ulegalize.atlassian.net/wiki/spaces/UC/pages/793378817/Open+source

Don't hesitate to create PR in order to change something in the project

#### Run in a terminal
`
yarn install
`  
change the file p`ackage-scripts.example.yml` to `package-scripts.yml`

### variables
REACT_APP_AUTH0_DOMAIN=
REACT_APP_AUTH_AUDIENCE=
REACT_APP_AUTH_CLIENT_ID=
REACT_APP_AUTH_RULES_URL=
REACT_APP_LOGOUT_URL=
REACT_APP_MAIN_URL=
REACT_APP_REDIRECT_URL=
REACT_APP_STRIPE=
REACT_APP_CONFLUENCE=
REACT_APP_CONDITIONS=https://www.ulegalize.com/wp-content/uploads/2021/09/Conditions-dutilisation.pdf
REACT_APP_PRIVACY=https://www.ulegalize.com/wp-content/uploads/2021/09/politique_de_confidentialite.pdf

## Labels
You can create issue in our repository  
https://github.com/openjusticebe/ulegalize-workspace-front/issues/new

Labels are sorted like :  
https://github.com/openjusticebe/ulegalize-workspace-front/labels

## Auth0
### language tenant 
the first is the default
```
curl --request PATCH \
--url 'https://YOUR_DOMAIN/api/v2/tenants/settings' \
--header 'authorization: Bearer MGMT_API_ACCESS_TOKEN' \
--header 'content-type: application/json' \
--data '{ "enabled_locales" : [ "fr", "en"]}'
```

### login
#### english
```
curl --request PUT \
--url 'https://YOUR_DOMAIN/api/v2/prompts/login/custom-text/en' \
--header 'authorization: Bearer MGMT_API_ACCESS_TOKEN' \
--header 'content-type: application/json' \
--data '{ "login": { "description": "Login to your workspace" } }'
```
#### french
```
curl --request PUT \
--url 'https://YOUR_DOMAIN/api/v2/prompts/login/custom-text/fr-FR' \
--header 'authorization: Bearer MGMT_API_ACCESS_TOKEN' \
--header 'content-type: application/json' \
--data '{ "login": { "description": "Se connecter à votre workspace" } }'
```
### signup
customize the labels
#### english
```
curl --request PUT \
--url 'https://YOUR_DOMAIN/api/v2/prompts/signup/custom-text/en' \
--header 'authorization: Bearer MGMT_API_ACCESS_TOKEN' \
--header 'content-type: application/json' \
--data '{ "signup": { "description": "Create your Workspace" } }'
```
#### french
```
curl --request PUT \
--url 'https://YOUR_DOMAIN/api/v2/prompts/signup/custom-text/fr-FR' \
--header 'authorization: Bearer MGMT_API_ACCESS_TOKEN' \
--header 'content-type: application/json' \
--data '{ "signup": { "description": "Creation d'\''un Workspace" } }'
```


