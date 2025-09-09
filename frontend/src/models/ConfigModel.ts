export class ConfigModel {
  public frequency: number; // MHz
  public power: number; // dBm
  public distance: number; // m
  public system: '5G' | '5G-A' | '6G';

  constructor(frequency: number = 3500, power: number = 23, distance: number = 200, system: '5G' | '5G-A' | '6G' = '5G') {
    this.frequency = frequency;
    this.power = power;
    this.distance = distance;
    this.system = system;
  }

  public validate(): ConfigValidation {
    const errors: string[] = [];
    if (this.frequency < 600 || this.frequency > 7100) errors.push('La frecuencia debe estar entre 600 y 7100 MHz');
    if (this.power < -10 || this.power > 46) errors.push('La potencia debe estar entre -10 y 46 dBm');
    if (this.distance < 1 || this.distance > 5000) errors.push('La distancia debe estar entre 1 y 5000 metros');
    return { isValid: errors.length === 0, errors };
  }

  public toJSON(): object {
    return { frequency: this.frequency, power: this.power, distance: this.distance, system: this.system };
  }
}

export interface ConfigValidation { isValid: boolean; errors: string[]; }

export const CONFIG_LIMITS = {
  frequency: { min: 600, max: 7100, step: 50 },
  power: { min: -10, max: 46, step: 1 },
  distance: { min: 1, max: 5000, step: 1 }
};

export const SYSTEM_OPTIONS: Array<'5G' | '5G-A' | '6G'> = ['5G', '5G-A', '6G'];