install ionic on heroku as website:
copy: 
"devDependencies": {               
    #-- all include for device - but www in heroku so: 
    "@ionic/app-scripts": "3.2.0", -- copy
    "typescript": "~2.6.2"         -- copy
  },

into:
"dependencies": {
    ....,
    "@ionic/app-scripts": "3.2.0", 
    "typescript": "~2.6.2"        
}

make: server.js

make: Procfile
web: npm run build && npm start
web: node server.js

make: herokuDeployment.sh
