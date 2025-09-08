export class ConfigModel {
  public frequency: number; // MHz
  public power: number; // dBm
  public distance: number; // m
  public system: '5G' | '5G-A' | '6G';

  constructor(frequency: number = 3000, power: number = 25, distance: number = 100, system: '5G' | '5G-A' | '6G' = '5G') {
    this.frequency = frequency;
    this.power = power;
    this.distance = distance;
    this.system = system;
  }

  public validate(): ConfigValidation {
    const errors: string[] = [];
    if (this.frequency < 1000 || this.frequency > 6000) errors.push('La frecuencia debe estar entre 1000 y 6000 MHz');
    if (this.power < 0 || this.power > 50) errors.push('La potencia debe estar entre 0 y 50 dBm');
    if (this.distance < 10 || this.distance > 1000) errors.push('La distancia debe estar entre 10 y 1000 metros');
    return { isValid: errors.length === 0, errors };
  }

  public toJSON(): object {
    return { frequency: this.frequency, power: this.power, distance: this.distance, system: this.system };
  }
}

export interface ConfigValidation { isValid: boolean; errors: string[]; }

export const CONFIG_LIMITS = {
  frequency: { min: 1000, max: 6000, step: 100 },
  power: { min: 0, max: 50, step: 1 },
  distance: { min: 10, max: 1000, step: 10 }
};

export const SYSTEM_OPTIONS: Array<'5G' | '5G-A' | '6G'> = ['5G', '5G-A', '6G'];