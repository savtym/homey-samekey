import Homey from 'homey';
import { PairSession } from 'homey/lib/Driver';

module.exports = class MyDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

  async onPair(session: PairSession) {
    session.setHandler('showView', async (view) => {
      if (view === 'loading') {
        if (this.homey.app.api.token) {
          await session.showView('list_devices');
        } else {
          await session.showView('login_credentials');
        }
      }
    });

    session.setHandler('login_credentials', async (data) => {
      const { password, username: email } = data;

      this.homey.app.api.setCredentials(email, password);

      const response = await this.homey.app.api.login();

      if (!response) {
        throw new Error('Failed to login');
      }

      this.homey.settings.set('email', email);
      this.homey.settings.set('password', password);
      this.homey.settings.set('token', response.token.id);
      this.homey.settings.set('expiredAt', response.token.expired_at);
      this.homey.settings.set('userId', response.user.id);

      return true;
    });

    session.setHandler('list_devices', async () => {
      const response = await this.homey.app.api.getDevices();

      const devices = response.map((myDevice) => {
        return {
          name: myDevice.name,
          data: {
            id: myDevice.id,
          },
          settings: {
            created: myDevice.created,
          },
        };
      });

      return devices;
    });
  }
};
