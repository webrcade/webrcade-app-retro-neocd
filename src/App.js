import React from "react";

import {
  WebrcadeRetroApp
} from '@webrcade/app-common';

import { Emulator } from './emulator';
import { EmulatorPauseScreen } from './pause';

import './App.scss';

class App extends WebrcadeRetroApp {
  createEmulator(app, isDebug) {
    return new Emulator(app, isDebug);
  }

  getBiosMap() {
    return {
      '11526d58d4c524daef7d5d677dc6b004': 'neocd/neocd_z.rom', // working
    };
  }

  getAlternateBiosMap() {
    return {
      '8834880c33164ccbe6476b559f3e37de': 'neocd/neocd_f.rom', // working
      // '043d76d5f0ef836500700c34faef774d': 'neocd/neocd_sf.rom	',
      'de3cf45d227ad44645b22aa83b49f450': 'neocd/neocd_t.rom', // working
      'f6325a33c6d63ea4b9162a3fa8c32727': 'neocd/neocd_st.rom', // working
      // '971ee8a36fb72da57aed01758f0a37f5': 'neocd/neocd_sz.rom	',
      '5c2366f25ff92d71788468ca492ebeca': 'neocd/front-sp1.bin', // working
      '122aee210324c72e8a11116e6ef9c0d0': 'neocd/top-sp1.bin', // working
      'f39572af7584cb5b3f70ae8cc848aba2': 'neocd/neocd.bin', // working
      // '08ca8b2dba6662e8024f9e789711c6fc': 'neocd/uni-bioscd.rom',
    };
  }

  getBiosUrls(appProps) {
    return appProps.neogeocd_bios;
  }

  renderPauseScreen() {
    const { appProps, emulator } = this;

    return (
      <EmulatorPauseScreen
        emulator={emulator}
        appProps={appProps}
        closeCallback={() => this.resume()}
        exitCallback={() => {
          this.exitFromPause();
        }}
        isEditor={this.isEditor}
        isStandalone={this.isStandalone}
      />
    );
  }
}

export default App;
