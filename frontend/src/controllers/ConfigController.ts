import { ConfigModel } from '../models/ConfigModel';
import { ResultsModel } from '../models/ResultsModel';

export class ConfigController {
  private currentConfig: ConfigModel;
  private results: ResultsModel | null = null;
  private listeners: Array<(results: ResultsModel | null) => void> = [];

  constructor() {
    this.currentConfig = new ConfigModel();
  }

  /**
   * Actualiza la configuración con nuevos valores
   */
  public updateConfig(frequency: number, power: number, distance: number): void {
    this.currentConfig = new ConfigModel(frequency, power, distance);
  }

  /**
   * Obtiene la configuración actual
   */
  public getCurrentConfig(): ConfigModel {
    return this.currentConfig;
  }

  /**
   * Valida la configuración actual
   */
  public validateConfig(): boolean {
    const validation = this.currentConfig.validate();
    return validation.isValid;
  }

  /**
   * Ejecuta la simulación con la configuración actual
   */
  public runSimulation(): void {
    if (!this.validateConfig()) {
      console.error('Configuración inválida');
      return;
    }

    // Crear resultados con la configuración actual
    this.results = new ResultsModel(this.currentConfig);
    
    // Notificar a los listeners
    this.notifyListeners();
  }

  /**
   * Obtiene los resultados actuales
   */
  public getResults(): ResultsModel | null {
    return this.results;
  }

  /**
   * Suscribirse a cambios en los resultados
   */
  public onResultsChange(callback: (results: ResultsModel | null) => void): () => void {
    this.listeners.push(callback);
    
    // Retornar función para desuscribirse
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notifica a todos los listeners sobre cambios
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.results));
  }

  /**
   * Resetea el controlador
   */
  public reset(): void {
    this.currentConfig = new ConfigModel();
    this.results = null;
    this.notifyListeners();
  }
}
