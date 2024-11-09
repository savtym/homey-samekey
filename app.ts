import Homey from 'homey';
// import { OAuth2App } from 'homey-oauth2app';
import Api from './common/api';
// import Api from './lib/MyBrandOAuth2Client';

module.exports = class SameKey extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp has been initialized');
    const email = this.homey.settings.get('email');
    const token = this.homey.settings.get('token');
    const password = this.homey.settings.get('password');

    this.api = new Api({ email, password, token });
  }
};
