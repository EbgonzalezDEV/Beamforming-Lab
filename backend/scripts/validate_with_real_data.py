import argparse
import csv
import math
from pathlib import Path
from typing import List, Dict

from services.SignalService import SignalService


def predict_power_rx_dbm(row: Dict[str, str],
                         system: str,
                         tx_gain_dbi: float,
                         rx_gain_dbi: float,
                         pol_mismatch_db: float,
                         system_gain_override: float | None) -> float:
    """
    Calcula P_rx(dBm) con las mismas fórmulas del backend.
    Columnas requeridas en row: distance_m, frequency_hz, tx_power_dbm
    """
    service = SignalService()
    distance_m = float(row["distance_m"]) 
    frequency_hz = float(row["frequency_hz"]) 
    power_dbm = float(row["tx_power_dbm"]) 

    fspl_db = float(service.fspl(distance_m, frequency_hz))

    if system_gain_override is None:
        if system == '5G-A':
            g_sys = 3.0
        elif system == '6G':
            g_sys = 6.0
        else:
            g_sys = 0.0
    else:
        g_sys = float(system_gain_override)

    g_ant = float(tx_gain_dbi + rx_gain_dbi)
    l_pol = float(pol_mismatch_db)

    power_rx_dbm = float(power_dbm - fspl_db + g_sys + g_ant - l_pol)
    return power_rx_dbm


def load_measurements(csv_path: Path) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    with csv_path.open('r', newline='') as f:
        reader = csv.DictReader(filter(lambda line: not line.strip().startswith('#'), f))
        for row in reader:
            rows.append(row)
    return rows


def compute_metrics(y_true: List[float], y_pred: List[float]) -> Dict[str, float]:
    errors = [yt - yp for yt, yp in zip(y_true, y_pred)]
    abs_err = [abs(e) for e in errors]
    mae = sum(abs_err) / len(abs_err) if abs_err else float('nan')
    rmse = math.sqrt(sum(e*e for e in errors) / len(errors)) if errors else float('nan')
    bias = sum(errors) / len(errors) if errors else float('nan')
    return {"MAE": mae, "RMSE": rmse, "Bias": bias}


def main():
    parser = argparse.ArgumentParser(description="Validación del modelo con datos reales (CSV)")
    parser.add_argument('--csv', type=Path, default=Path('data/example_measurements.csv'),
                        help='Ruta al CSV con columnas: distance_m,frequency_hz,tx_power_dbm,measured_power_dbm_rx')
    parser.add_argument('--system', type=str, default='5G', choices=['5G', '5G-A', '6G'],
                        help='Sistema a usar para la ganancia del sistema')
    parser.add_argument('--tx-gain-dbi', type=float, default=0.0)
    parser.add_argument('--rx-gain-dbi', type=float, default=0.0)
    parser.add_argument('--pol-mismatch-db', type=float, default=0.0,
                        help='Pérdida por desajuste de polarización (0 si H-H o V-V; 20 si H-V o V-H)')
    parser.add_argument('--system-gain-override', type=float, default=None,
                        help='Si se especifica, reemplaza la ganancia por sistema por defecto (dB)')

    args = parser.parse_args()

    rows = load_measurements(args.csv)
    if not rows:
        print(f"No se encontraron filas en {args.csv}. Asegúrate de que el CSV tenga encabezado y datos.")
        return

    y_true: List[float] = []
    y_pred: List[float] = []

    for row in rows:
        try:
            prx_pred = predict_power_rx_dbm(row,
                                            system=args.system,
                                            tx_gain_dbi=args.tx_gain_dbi,
                                            rx_gain_dbi=args.rx_gain_dbi,
                                            pol_mismatch_db=args.pol_mismatch_db,
                                            system_gain_override=args.system_gain_override)
            meas = float(row['measured_power_dbm_rx'])
        except KeyError as e:
            print(f"Fila inválida, falta columna {e}: {row}")
            continue
        except ValueError as e:
            print(f"Fila inválida, error de conversión {e}: {row}")
            continue

        y_true.append(meas)
        y_pred.append(prx_pred)

    metrics = compute_metrics(y_true, y_pred)

    print("Validación del modelo con datos reales\n" + "-"*40)
    print(f"Archivo: {args.csv}")
    print(f"Sistema: {args.system}")
    print(f"Ganancias antena (dBi): TX={args.tx_gain_dbi}, RX={args.rx_gain_dbi}")
    print(f"Pérdida polarización (dB): {args.pol_mismatch_db}")
    if args.system_gain_override is not None:
        print(f"Override G_sys: {args.system_gain_override} dB")
    print("\nMétricas:")
    print(f"  MAE  = {metrics['MAE']:.3f} dB")
    print(f"  RMSE = {metrics['RMSE']:.3f} dB")
    print(f"  Bias = {metrics['Bias']:.3f} dB (positivo = modelo subestima pérdidas)")

    print("\nPrimeras comparaciones (y_true vs y_pred):")
    for i, (yt, yp) in enumerate(list(zip(y_true, y_pred))[:5]):
        print(f"  [{i}] medido={yt:.2f} dBm, predicho={yp:.2f} dBm, error={yt-yp:.2f} dB")


if __name__ == '__main__':
    main()
