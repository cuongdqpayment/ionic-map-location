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
#Lenh build va start se doc script trong package.json de chay cai gi
#vi du: 
"scripts": {
    "start": "ionic-app-scripts serve", --> bat dau chay ionic
    "clean": "ionic-app-scripts clean", --> lenh lam sach
    "build": "ionic-app-scripts build", --> lenh xay dung
    "lint": "ionic-app-scripts lint"    --> lenh lint
  },
#web: node server.js


make: herokuDeployment.sh
