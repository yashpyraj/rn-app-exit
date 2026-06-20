import { AppExit } from '../src/index';

jest.mock('../src/NativeAppExit', () => ({
  exitApp: jest.fn(),
  sendToBackground: jest.fn(),
  getConstants: () => ({ isBackgroundSupported: true }),
}));

const NativeAppExit = jest.requireMock('../src/NativeAppExit');

describe('AppExit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes isBackgroundSupported from native constants', () => {
    expect(AppExit.isBackgroundSupported).toBe(true);
  });

  it('exitApp() calls native exitApp', () => {
    AppExit.exitApp();
    expect(NativeAppExit.exitApp).toHaveBeenCalledTimes(1);
  });

  it('sendToBackground() calls native sendToBackground', () => {
    AppExit.sendToBackground();
    expect(NativeAppExit.sendToBackground).toHaveBeenCalledTimes(1);
  });

  it('exit() with no options calls exitApp', () => {
    AppExit.exit();
    expect(NativeAppExit.exitApp).toHaveBeenCalledTimes(1);
    expect(NativeAppExit.sendToBackground).not.toHaveBeenCalled();
  });

  it('exit({ background: true }) calls sendToBackground', () => {
    AppExit.exit({ background: true });
    expect(NativeAppExit.sendToBackground).toHaveBeenCalledTimes(1);
    expect(NativeAppExit.exitApp).not.toHaveBeenCalled();
  });

  it('exit({ background: false }) calls exitApp', () => {
    AppExit.exit({ background: false });
    expect(NativeAppExit.exitApp).toHaveBeenCalledTimes(1);
    expect(NativeAppExit.sendToBackground).not.toHaveBeenCalled();
  });
});
