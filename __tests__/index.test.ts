const nativeMock = {
  exitApp: jest.fn(),
  sendToBackground: jest.fn(),
  getConstants: jest.fn(() => ({ isBackgroundSupported: true })),
};

/** Load a fresh copy of the module with a given native module and platform. */
function loadAppExit(opts: { native: unknown; os?: string }) {
  let mod: typeof import('../src/index');
  jest.isolateModules(() => {
    jest.doMock('../src/NativeAppExit', () => ({
      __esModule: true,
      default: opts.native,
    }));
    if (opts.os) {
      // Mock the Platform module itself, not the react-native barrel — spreading
      // the barrel eagerly evaluates every lazy getter on it and tries to resolve
      // unrelated native modules.
      // Platform.{ios,android}.js use `module.exports = Platform` (no __esModule),
      // and the react-native barrel requires it without `.default`.
      jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
        OS: opts.os,
        select: (spec: Record<string, unknown>) =>
          spec[opts.os as string] ?? spec.default,
      }));
    }
    mod = require('../src/index');
  });
  // @ts-expect-error assigned inside isolateModules
  return mod.AppExit;
}

describe('AppExit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('with the native module available', () => {
    const load = () => loadAppExit({ native: nativeMock, os: 'android' });

    it('reports isAvailable', () => {
      expect(load().isAvailable).toBe(true);
    });

    it('exposes isBackgroundSupported from native constants', () => {
      expect(load().isBackgroundSupported).toBe(true);
    });

    it('exitApp() calls native exitApp', () => {
      load().exitApp();
      expect(nativeMock.exitApp).toHaveBeenCalledTimes(1);
    });

    it('sendToBackground() calls native sendToBackground', () => {
      load().sendToBackground();
      expect(nativeMock.sendToBackground).toHaveBeenCalledTimes(1);
    });

    it('exit() with no options calls exitApp', () => {
      load().exit();
      expect(nativeMock.exitApp).toHaveBeenCalledTimes(1);
      expect(nativeMock.sendToBackground).not.toHaveBeenCalled();
    });

    it('exit({ background: true }) calls sendToBackground', () => {
      load().exit({ background: true });
      expect(nativeMock.sendToBackground).toHaveBeenCalledTimes(1);
      expect(nativeMock.exitApp).not.toHaveBeenCalled();
    });

    it('exit({ background: false }) calls exitApp', () => {
      load().exit({ background: false });
      expect(nativeMock.exitApp).toHaveBeenCalledTimes(1);
      expect(nativeMock.sendToBackground).not.toHaveBeenCalled();
    });
  });

  describe('when the native module is missing', () => {
    const load = () => loadAppExit({ native: null, os: 'android' });

    it('does not throw at import time', () => {
      expect(() => load()).not.toThrow();
    });

    it('reports isAvailable as false', () => {
      expect(load().isAvailable).toBe(false);
    });

    it('reports isBackgroundSupported as false instead of throwing', () => {
      expect(load().isBackgroundSupported).toBe(false);
    });

    it('throws an actionable error when called', () => {
      expect(() => load().exitApp()).toThrow(/could not be found/);
      expect(() => load().sendToBackground()).toThrow(/rebuilt the app/);
    });
  });

  describe('on an unsupported platform', () => {
    const load = () => loadAppExit({ native: null, os: 'web' });
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => warn.mockRestore());

    it('no-ops instead of throwing', () => {
      expect(() => load().exitApp()).not.toThrow();
      expect(() => load().sendToBackground()).not.toThrow();
    });

    it('warns in development', () => {
      load().exitApp();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("was called on 'web'"),
      );
    });

    it('reports isBackgroundSupported as false', () => {
      expect(load().isBackgroundSupported).toBe(false);
    });
  });
});
