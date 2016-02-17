

HubTaxi: Server Side
===

### Technology use:
- Serverside:
  - Node.js 
  - Expressjs
  - MongoDB (mongoose)
  - Socket.io
- Clientside:
  - Angularjs Framework.
  - Bootstrap Twitter.
  - Phonegap, cordova and ionic framework. (for hybrid app)

### Setup:
- Clone this repo to your local machine by: `git clone https://github.com/vsoft-lab/HubTaxi-Server`.
- Okay, after clone it, you can install all dependencies by type: `npm install` on your terminal.
- I used to mongo database for this repo, because you must install and start mongodb. In your terminal: `sudo /etc/init.d/mongodb start`
- Use `mongorestore -d mydb dump/mydb` to restore database.
- Fix path mongodb: config/init.js --> `_db: 'mongodb://localhost/mydb'`
- Finally, you can start server with command: `npm start` and then, your server will start at `http://localhost:6868`

===
### Reference :
- Manager:
  - Source code: `https://github.com/vsoft-lab/HubTaxi-Client/tree/master/manager`
  - Demo: `http://103.232.121.63/taxi/webapp/manager/#/main` - User: `admin` | Password: `admin`
  - Some screenshot:
  Login:
  ![login](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/login.png)
  Main:
  ![main](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/main.png)
  ManageType:
  ![managetype](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/managerCartype.png)
  Setting:
  ![setting](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/setting.png)

- Driver: 
  - Source code: `https://github.com/vsoft-lab/HubTaxi-Client/tree/master/driver`
  - Demo: `http://103.232.121.63/taxi/webapp/driver/#/` user/pass: 30h-9999/123123
  - Screenshot:

  ![driver1](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/driver1.png)
  ![driverLoad](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/driverLoad.png)
  
  ===
  
  ![driverLogin](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/driverLogin.png)
  ![history](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/histories.png)
  
- Client: 
  - Source code: `https://github.com/vsoft-lab/HubTaxi-Client/tree/master/client`
  - Demo: `http://103.232.121.63/taxi/webapp/client/#/home`
  - Screenshot:

  ![client1](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/client1.png)
  ![client2](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/showTaxi.png)
  
  ===
  
  ![client3](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/client3.png)
  ![clientLogin](https://github.com/vsoft-lab/HubTaxi-Server/blob/master/screenshot/clientLogin.png)


Contact me at tungnguyen@vsoft.vn || Skype: tungtouch
