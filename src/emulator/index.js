import {
  Controller,
  Controllers,
  KeyCodeToControlMapping,
  RetroAppWrapper,
  CIDS,
  KCODES,
  LOG,
} from '@webrcade/app-common';

export class Emulator extends RetroAppWrapper {

  constructor(app, debug = false) {
    super(app, debug);

    // Allow game saves to persist after loading state
    this.saveManager.setDisableGameSaveOnStateLoad(false);
  }

  GAME_SRAM_NAME = 'game.srm';
  SAVE_NAME = 'sav';

  createControllers() {
    return new Controllers([
      new Controller(
        new KeyCodeToControlMapping({
          [KCODES.ARROW_UP]: CIDS.UP,
          [KCODES.ARROW_DOWN]: CIDS.DOWN,
          [KCODES.ARROW_RIGHT]: CIDS.RIGHT,
          [KCODES.ARROW_LEFT]: CIDS.LEFT,
          [KCODES.Z]: CIDS.A,
          [KCODES.X]: CIDS.B,
          [KCODES.C]: CIDS.X,
          [KCODES.V]: CIDS.Y,
          [KCODES.SHIFT_RIGHT]: CIDS.SELECT,
          [KCODES.ENTER]: CIDS.START,
          [KCODES.ESCAPE]: CIDS.ESCAPE
        })
      ),
      new Controller(),
      new Controller(),
      new Controller(),
    ]);
  }

  getScriptUrl() {
    return 'js/neocd_libretro.js';
  }

  getPrefs() {
    return this.prefs;
  }

  async saveState() {
    const { saveStatePath, started } = this;
    const { FS, Module } = window;

    try {
      if (!started) {
        return;
      }

      // Save to files
      Module._cmd_savefiles();

      let path = '';
      const files = [];
      let s = null;

      path = `/home/web_user/retroarch/userdata/saves/${this.GAME_SRAM_NAME}`;
      LOG.info('Checking: ' + path);
      try {
        s = FS.readFile(path);
        if (s) {
          LOG.info('Found save file: ' + path);
          files.push({
            name: this.SAVE_NAME,
            content: s,
          });
        }
      } catch (e) {}

      if (files.length > 0) {
        if (await this.getSaveManager().checkFilesChanged(files)) {
          await this.getSaveManager().save(
            saveStatePath,
            files,
            this.saveMessageCallback,
          );
        }
      } else {
        await this.getSaveManager().delete(path);
      }
    } catch (e) {
      LOG.error('Error persisting save state: ' + e);
    }
  }

  async loadState() {
    const { saveStatePath } = this;
    const { FS } = window;

    // Write the save state (if applicable)
    try {
      // Load
      const files = await this.getSaveManager().load(
        saveStatePath,
        this.loadMessageCallback,
      );

      if (files) {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          if (f.name === this.SAVE_NAME) {
            LOG.info(`writing ${this.GAME_SRAM_NAME} file`);
            FS.writeFile(
              `/home/web_user/retroarch/userdata/saves/${this.GAME_SRAM_NAME}`,
              f.content,
            );
          }
        }

        // Cache the initial files
        await this.getSaveManager().checkFilesChanged(files);
      }
    } catch (e) {
      LOG.error('Error loading save state: ' + e);
    }
  }

  applyGameSettings() {
    const { Module } = window;
    const props = this.getProps();
    let options = 0;

    if (props.cdSpeedHack !== undefined && props.cdSpeedHack === false) {
      LOG.info('## cd speed hack off');
      options |= this.OPT1;
    } else {
      LOG.info('## cd speed hack on');
    }

    if (props.skipCdLoading !== undefined && props.skipCdLoading === false) {
      LOG.info('## skip cd loading off');
      options |= this.OPT2;
    } else {
      LOG.info('## skip cd loading on');
    }

    if (props.region) {
      if (props.region === 1) {
        // Japan
        options |= this.OPT3;
      } else if (props.region === 2) {
        // Europe
        options |= this.OPT4;
      }
    }

    Module._wrc_set_options(options);
  }

  // resizeScreen(canvas) {
  //   // Determine the zoom level
  //   let zoomLevel = 0;
  //   if (this.getProps().zoomLevel) {
  //     zoomLevel = this.getProps().zoomLevel;
  //   }

  //   const wsize = 98 + zoomLevel;
  //   const hsize = 96 + zoomLevel;
  //   canvas.style.setProperty('width', `${wsize}vw`, 'important');
  //   canvas.style.setProperty('height', `${hsize}vh`, 'important');
  //   canvas.style.setProperty('max-width', `calc(${hsize}vh*1.333)`, 'important');
  //   canvas.style.setProperty('max-height', `calc(${wsize}vw*0.75)`, 'important');
  // }

  // getShotAspectRatio() { return 1.333; }

  isForceAspectRatio() {
    return false;
  }

  getDefaultAspectRatio() {
    return 1.333;
  }

  resizeScreen(canvas) {
    this.canvas = canvas;
    // // Determine the zoom level
    // let zoomLevel = 0;
    // if (this.getProps().zoomLevel) {
    //   zoomLevel = this.getProps().zoomLevel;
    // }

    // const size = 96 + zoomLevel;
    // canvas.style.setProperty('width', `${size}vw`, 'important');
    // canvas.style.setProperty('height', `${size}vh`, 'important');
    // canvas.style.setProperty('max-width', `calc(${size}vh*1.22)`, 'important');
    // canvas.style.setProperty('max-height', `calc(${size}vw*0.82)`, 'important');
    this.updateScreenSize();
  }

  getShotAspectRatio() { return this.getDefaultAspectRatio(); }
}
