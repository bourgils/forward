import EnvService from './EnvService.js';
import DetectorService from './DetectorService.js';
import RunnerService from './RunnerService.js';

class ServiceFactory {
  constructor() {
    this._envService = new EnvService();
    this._detectorService = new DetectorService();
    this._runnerService = new RunnerService(this._envService);
  }

  get envService() {
    return this._envService;
  }

  get detectorService() {
    return this._detectorService;
  }

  get runnerService() {
    return this._runnerService;
  }
}

export default new ServiceFactory();
