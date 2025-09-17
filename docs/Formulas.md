# Beamforming Lab — Fórmulas y Modelado

Este documento resume las ecuaciones y suposiciones implementadas en el backend (`backend/services/SignalService.py`) para el cálculo de enlace y la simulación del espectro. Puedes exportar este documento a PDF siguiendo las instrucciones al final.

## 1. Pérdida por Trayectoria en Espacio Libre (FSPL)

- Constante de la velocidad de la luz: `c = 299,792,458 m/s`.
- Longitud de onda: `λ = c / f`.
- FSPL en dB:

```
FSPL(dB) = 20·log10(4·π·d / λ) = 20·log10(d) + 20·log10(f) + 32.44  (d en km, f en MHz)
```

En el código (unidades SI):

```
λ = c / f
FSPL(dB) = 20 * log10( 4π d / λ )
```

## 2. Ganancias y Pérdidas del Sistema

- Ganancia de antena efectiva (simplificada):
```
G_ant (dB) = G_tx(dBi) + G_rx(dBi)
```
- Desajuste de polarización (simplificado):
```
L_pol (dB) = 0 si polarizaciones iguales (H-H o V-V)
L_pol (dB) = 20 si ortogonales (H-V o V-H)
```
- Ganancia por mejoras del sistema (mapa simple):
```
System = '5G'   → G_sys = 0 dB
System = '5G-A' → G_sys = +3 dB
System = '6G'   → G_sys = +6 dB
```

## 3. Potencia Recibida (Enlace)

Con potencia transmitida `P_tx` en dBm:

```
P_rx(dBm) = P_tx(dBm) - FSPL(dB) + G_sys(dB) + G_ant(dB) - L_pol(dB)
```

## 4. Piso de Ruido y SNR

- Piso de ruido térmico (kTB) en dBm:
```
N_floor(dBm) = -174 dBm/Hz + 10·log10(B) + NF
```
Donde `B` es el ancho de banda en Hz y `NF` es la figura de ruido (en el modelo, NF = 5 dB por defecto).

- Relación Señal a Ruido (SNR):
```
SNR(dB) = P_rx(dBm) - N_floor(dBm)
```

## 5. Simulación en Banda Base y Espectro

Para generar un ejemplo de espectro en el frontend, se simula una señal seno de baja frecuencia y ruido aditivo blanco gaussiano (AWGN) que cumple con la SNR calculada:

- Parámetros:
```
frecuencia_tono = 10 kHz
fs (tasa de muestreo) = 500 kHz
duración = 20 ms
```
- Señal y ruido:
```
SNR_linear = 10^(SNR_dB/10)
A_signal = 1.0 (arbitrario)
A_noise = sqrt( A_signal^2 / SNR_linear )
received[n] = A_signal·sin(2π·f_tono·t[n]) + noise[n]
```
- Espectro (magnitud en dB):
```
Y = rfft(received)
|Y|_dB = 20·log10(|Y| + 1e-12)
```
Se usa `rfft` y `rfftfreq` para frecuencias no negativas.

## 6. Selección de Ancho de Banda por Sistema

Si el usuario no especifica `bandwidth_hz`, el servicio elige un valor por defecto por sistema:

```
'5G'   → 20 MHz
'5G-A' → 80 MHz
'6G'   → 200 MHz
```

## 7. Datos de Alcance

Para curvas de alcance, se evalúa el enlace en un conjunto de distancias `d ∈ [d_min, d_max]` y se calcula `P_rx`, `SNR` y `FSPL` usando las fórmulas anteriores. Los límites se adaptan alrededor de una distancia base del usuario si está disponible.

## 8. Unidades y Convenciones

- Potencias: dBm.
- Ganancias/Pérdidas: dB o dBi según corresponda.
- Frecuencia: Hz.
- Distancia: metros.
- Ancho de banda: Hz.
- Polarización: 'H' (horizontal) o 'V' (vertical).

## 9. Limitaciones y Suposiciones

- El modelo usa espacio libre (no contempla multitrayecto, difracción ni obstrucciones).
- `G_sys` es un offset simple que agrupa mejoras de sistema (ej. agregación, MIMO, FEC) y no modela fenómenos específicos.
- La ganancia de antena declarada por el usuario debe reflejar directividad y ancho de haz; no se aplica otra penalización por beamwidth.
- `NF = 5 dB` fijo.
- La simulación de banda base sirve solo para visualizar espectro; no representa la señal RF real a `frequency_hz`.

---

# Exportación a PDF (Windows)

Puedes exportar este Markdown a PDF de varias formas:

1) Visual Studio Code
- Instala la extensión "Markdown PDF" (yzane.markdown-pdf).
- Abre `docs/Formulas.md` y ejecuta "Markdown PDF: Export (pdf)".

2) Pandoc (si lo tienes instalado)
- Descarga e instala Pandoc desde https://pandoc.org/installing.html y MikTeX (para LaTeX) si deseas mejor tipografía.
- En PowerShell, dentro del directorio del proyecto:
```
pandoc docs/Formulas.md -o docs/Formulas.pdf
```

3) Navegador
- Abre el archivo en un visor Markdown o en GitHub y usa "Imprimir" → "Guardar como PDF".

---

# Referencias
- Rappaport, T.S. Wireless Communications. Principles and Practice.
- 3GPP specifications (valores típicos de anchos de banda y ruido térmico).
- Documentación de SciPy/NumPy para FFT y transformadas reales.
