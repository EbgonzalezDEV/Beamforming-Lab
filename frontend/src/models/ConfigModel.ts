export type Polarization = 'H' | 'V';

export interface AntennaConfig {
  gain_dbi: number;
  polarization: Polarization;
  beamwidth_deg: number;
}

export class ConfigModel {
  public frequency: number; // MHz
  public power: number; // dBm
  public distance: number; // m
  public system: '5G' | '5G-A' | '6G';
  public tx_antenna: AntennaConfig;
  public rx_antenna: AntennaConfig;
  public bandwidth_mhz: number; // MHz

  constructor(
    frequency: number = 3500,
    power: number = 23,
    distance: number = 200,
    system: '5G' | '5G-A' | '6G' = '5G',
    tx_antenna: AntennaConfig = { gain_dbi: 15, polarization: 'H', beamwidth_deg: 65 },
    rx_antenna: AntennaConfig = { gain_dbi: 15, polarization: 'H', beamwidth_deg: 65 },
    bandwidth_mhz?: number
  ) {
    this.frequency = frequency;
    this.power = power;
    this.distance = distance;
    this.system = system;
    this.tx_antenna = tx_antenna;
    this.rx_antenna = rx_antenna;
    // Default bandwidth per system if not provided
    const defaults: Record<'5G' | '5G-A' | '6G', number> = { '5G': 20, '5G-A': 80, '6G': 200 };
    this.bandwidth_mhz = bandwidth_mhz ?? defaults[system];
  }

  public validate(): ConfigValidation {
    const errors: string[] = [];
    if (this.frequency < 600 || this.frequency > 7100) errors.push('La frecuencia debe estar entre 600 y 7100 MHz');
    if (this.power < -10 || this.power > 46) errors.push('La potencia debe estar entre -10 y 46 dBm');
    if (this.distance < 1 || this.distance > 5000) errors.push('La distancia debe estar entre 1 y 5000 metros');
    if (this.tx_antenna.gain_dbi < -10 || this.tx_antenna.gain_dbi > 30) errors.push('La ganancia TX debe estar entre -10 y 30 dBi');
    if (this.rx_antenna.gain_dbi < -10 || this.rx_antenna.gain_dbi > 30) errors.push('La ganancia RX debe estar entre -10 y 30 dBi');
    if (this.tx_antenna.beamwidth_deg <= 0 || this.tx_antenna.beamwidth_deg > 360) errors.push('El ancho de haz TX debe estar entre 0 y 360°');
    if (this.rx_antenna.beamwidth_deg <= 0 || this.rx_antenna.beamwidth_deg > 360) errors.push('El ancho de haz RX debe estar entre 0 y 360°');
    if (this.bandwidth_mhz <= 0 || this.bandwidth_mhz > 1000) errors.push('El ancho de banda debe ser mayor que 0 y menor a 1000 MHz');
    return { isValid: errors.length === 0, errors };
  }

  public toJSON(): object {
    return {
      frequency: this.frequency,
      power: this.power,
      distance: this.distance,
      system: this.system,
      tx_antenna: this.tx_antenna,
      rx_antenna: this.rx_antenna,
      bandwidth_hz: this.bandwidth_mhz * 1e6
    };
  }
}

export interface ConfigValidation { isValid: boolean; errors: string[]; }

export const CONFIG_LIMITS = {
  frequency: { min: 600, max: 7100, step: 50 },
  power: { min: -10, max: 46, step: 1 },
  distance: { min: 1, max: 5000, step: 1 },
  gain_dbi: { min: -10, max: 30, step: 1 },
  beamwidth_deg: { min: 1, max: 360, step: 1 }
};

export const SYSTEM_OPTIONS: Array<'5G' | '5G-A' | '6G'> = ['5G', '5G-A', '6G'];