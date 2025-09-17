import math
import numpy as np
import pytest

from services.SignalService import SignalService


def test_fspl_matches_km_mhz_formula():
    service = SignalService()
    # d = 1 km, f = 1000 MHz (1 GHz)
    d_m = 1000.0
    f_hz = 1_000_000_000.0
    fspl_si = service.fspl(d_m, f_hz)
    # Common formula with d in km and f in MHz
    d_km = d_m / 1000.0
    f_mhz = f_hz / 1e6
    fspl_km_mhz = 20 * math.log10(d_km) + 20 * math.log10(f_mhz) + 32.44
    assert abs(fspl_si - fspl_km_mhz) < 1e-6


def test_snr_consistency_with_noise_floor():
    service = SignalService()
    power_dbm = 30.0
    frequency_hz = 3_500_000_000.0
    distance_m = 1000.0
    results = service.simulate(power_dbm, frequency_hz, distance_m, system='5G',
                               tx_gain_dbi=10.0, rx_gain_dbi=10.0, bandwidth_hz=20e6)
    # Recompute expected
    fspl_db = service.fspl(distance_m, frequency_hz)
    g_sys = 0.0
    g_ant = 10.0 + 10.0
    l_pol = 0.0
    power_rx = power_dbm - fspl_db + g_sys + g_ant - l_pol
    nf_db = 5.0
    noise_floor = -174.0 + 10 * math.log10(20e6) + nf_db
    snr_expected = power_rx - noise_floor
    assert abs(results["power_received"] - power_rx) < 1e-6
    assert abs(results["snr"] - snr_expected) < 1e-6


def test_generate_signal_range_data_monotonic_path_loss():
    service = SignalService()
    data = service.generate_signal_range_data(power_dbm=20.0, frequency_hz=2.4e9, system='5G')
    assert len(data) == 50
    path_losses = [row["path_loss"] for row in data]
    # Strictly increasing with distance (linspace ascending)
    assert all(path_losses[i] < path_losses[i+1] for i in range(len(path_losses)-1))


def test_compare_all_systems_structure():
    service = SignalService()
    comp = service.compare_all_systems(power_dbm=20.0, frequency_hz=3.5e9, distance_m=500.0)
    assert set(comp.keys()) == {"systems", "range_data", "parameters"}
    for sys in ['5G', '5G-A', '6G']:
        assert sys in comp["systems"]
        sys_entry = comp["systems"][sys]
        assert all(k in sys_entry for k in ["power_received", "snr", "path_loss", "bandwidth_hz", "system_gain"]) 
        assert sys in comp["range_data"]
        assert isinstance(comp["range_data"][sys], list) and len(comp["range_data"][sys]) > 0
