import * as Homey from 'homey';
import type Api from './common/api';

declare module 'homey' {
  interface App {
    api: Api;
  }
}
