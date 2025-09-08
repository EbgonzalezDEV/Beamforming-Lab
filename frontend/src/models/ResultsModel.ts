import { ConfigModel } from './ConfigModel';

export class ResultsModel {
  public config: ConfigModel;
  public timestamp: string;
  public simulationId: string;

  constructor(config: ConfigModel) {
    this.config = config;
    this.timestamp = new Date().toISOString();
    this.simulationId = this.generateSimulationId();
  }

  private generateSimulationId(): string {
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getSummary(): object {
    return {
      simulationId: this.simulationId,
      timestamp: this.timestamp,
      parameters: {
        frequency: `${this.config.frequency} MHz`,
        power: `${this.config.power} dBm`,
        distance: `${this.config.distance} m`
      }
    };
  }

  public toJSON(): object {
    return {
      config: this.config.toJSON(),
      timestamp: this.timestamp,
      simulationId: this.simulationId
    };
  }
}