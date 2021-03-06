const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');

const status = getModule(['updateRemoteSettings'], false);
const statusStore = getModule([ 'isMobileOnline' ], false);

const Settings = require('./components/settings');

let prevStatus;
let prevDStatus;
let check = false;

module.exports = class AFKonExit extends Plugin {
  startPlugin() {
    this.cumIntoClient = this.cumIntoClient.bind(this);
    this.throttledCum = _.debounce(this.cumIntoClient, 3000);
    
    document.addEventListener('visibilitychange', this.throttledCum, false);
    powercord.api.settings.registerSettings(this.entityID, {
      label: 'AFK on Exit',
      category: this.entityID,
      render: Settings
    });
  }
  
  cumIntoClient() {
    const currentUser = getModule(['getCurrentUser'], false).getCurrentUser().id;
    const restoreStatus = this.settings.get('restoreStatus', true);
    
    if (restoreStatus && document.visibilityState === 'hidden' && check === false) {
      prevDStatus = statusStore.getStatus(currentUser);
      console.log('[AFK-on-exit] Restoring previous Status');
    }
    if (document.visibilityState === 'hidden' && prevStatus !== 'hidden') {
      prevStatus = 'hidden';
      check = true;
      status.updateRemoteSettings({ status: this.settings.get('closingStatus', 'idle').value || 'idle' });
    } else if (document.visibilityState === 'visible' && prevStatus === 'hidden') {
      prevStatus = 'visible';
      check = false;
      status.updateRemoteSettings({ status: `${restoreStatus ? prevDStatus : this.settings.get('openingStatus', 'online').value || 'online'}` });
    }
  }
  
  pluginWillUnload() {
    document.removeEventListener('visibilitychange', this.throttledCum, false);
    powercord.api.settings.unregisterSettings(this.entityID);
  }
};
