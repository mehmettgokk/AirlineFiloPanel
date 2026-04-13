import pandas as pd
import os
import json 


# Gelecekte yeni bir firma eklemek veya bilgi güncellemek için bu bölümü düzenleyebilirsiniz.
model_map = {

    'Airbus A319-100': 'models/airbus_a320-200/scene.gltf',
    'Airbus A320-200': 'models/airbus_a320-200/scene.gltf',
    'Airbus A320neo': 'models/airbus_a320-200/scene.gltf', 


    'Airbus A321-200': 'models/airbus_a321/scene.gltf',
    'Airbus A321neo': 'models/airbus_a321/scene.gltf',
    'Airbus A321XLR': 'models/airbus_a321/scene.gltf',
    'Airbus A321LR': 'models/airbus_a321/scene.gltf',


    'Airbus A330-200': 'models/airbus_a330/scene.gltf',
    'Airbus A330-300': 'models/airbus_a330/scene.gltf',


    'Airbus A350-900': 'models/airbus_a330/scene.gltf', 


    'Airbus A220-100': 'models/airplane_crj-900_cityjet/scene.gltf',
    'Airbus A220-300': 'models/airplane_crj-900_cityjet/scene.gltf',


    'Boeing 737-700': 'models/boeing_737_max_8/scene.gltf',
    'Boeing 737-800': 'models/boeing_737_max_8/scene.gltf',
    'Boeing 737-900ER': 'models/boeing_737_max_8/scene.gltf',
    'Boeing 737 MAX 7': 'models/boeing_737_max_8/scene.gltf', 
    'Boeing 737 MAX 8': 'models/boeing_737_max_8/scene.gltf',
    'Boeing 737 MAX 9': 'models/boeing_737_max_8/scene.gltf',
    'Boeing 717-200': 'models/boeing_737_max_8/scene.gltf', 
    'Boeing 757-200': 'models/boeing_737_max_8/scene.gltf', 
    'Boeing 757-300': 'models/boeing_737_max_8/scene.gltf', 

    'Boeing 767-300ER': 'models/boeing_777-300er_model/scene.gltf', 
    'Boeing 767-400ER': 'models/boeing_777-300er_model/scene.gltf', 
    'Boeing 777-200ER': 'models/boeing_777_free_interior/scene.gltf',
    'Boeing 777-300ER': 'models/boeing_777_free_interior/scene.gltf',


    'Boeing 787-8': 'models/boeing_787/scene.gltf',
    'Boeing 787-9': 'models/boeing_787/scene.gltf',
    'Boeing 787-10': 'models/boeing_787/scene.gltf',


    'Embraer 170': 'models/embraer-erj-145/scene.gltf',
    'Embraer 175': 'models/embraer-erj-145/scene.gltf',
    'Bombardier CRJ-100 Series': 'models/airplane_crj-900_cityjet/scene.gltf',
    'Bombardier CRJ-700': 'models/airplane_crj-900_cityjet/scene.gltf',
    'Bombardier CRJ-900': 'models/airplane_crj-900_cityjet/scene.gltf',
}

master_filo_data = {
    '9E': {'name': 'Endeavor Air', 'fleet': [{'model': 'Bombardier CRJ-900', 'adet': 122, 'koltuk': 77, 'menzil_km': 2956, 'mtow_kg': 38330, 'pilot_sayisi': 2, 'kabin_ekibi': 3, 'kanat_acikligi_m': 24.9}, {'model': 'Bombardier CRJ-700', 'adet': 12, 'koltuk': 72, 'menzil_km': 2830, 'mtow_kg': 34019, 'pilot_sayisi': 2, 'kabin_ekibi': 3, 'kanat_acikligi_m': 23.2}]},
    'AA': {'name': 'American Airlines', 'fleet': [{'model': 'Airbus A319-100', 'adet': 132, 'koltuk': 128, 'menzil_km': 6850, 'mtow_kg': 75500, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A320-200', 'adet': 48, 'koltuk': 150, 'menzil_km': 6100, 'mtow_kg': 78000, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321-200', 'adet': 218, 'koltuk': 190, 'menzil_km': 5950, 'mtow_kg': 93500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321neo', 'adet': 84, 'koltuk': 196, 'menzil_km': 7400, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737-800', 'adet': 303, 'koltuk': 172, 'menzil_km': 5400, 'mtow_kg': 79000, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737 MAX 8', 'adet': 81, 'koltuk': 172, 'menzil_km': 6570, 'mtow_kg': 82190, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 777-200ER', 'adet': 47, 'koltuk': 270, 'menzil_km': 13080, 'mtow_kg': 297550, 'pilot_sayisi': 2, 'kabin_ekibi': 11, 'kanat_acikligi_m': 60.9}, {'model': 'Boeing 777-300ER', 'adet': 20, 'koltuk': 273, 'menzil_km': 13650, 'mtow_kg': 351530, 'pilot_sayisi': 2, 'kabin_ekibi': 13, 'kanat_acikligi_m': 64.8}, {'model': 'Boeing 787-8', 'adet': 37, 'koltuk': 234, 'menzil_km': 13620, 'mtow_kg': 228000, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.1}, {'model': 'Boeing 787-9', 'adet': 30, 'koltuk': 285, 'menzil_km': 14010, 'mtow_kg': 254000, 'pilot_sayisi': 2, 'kabin_ekibi': 11, 'kanat_acikligi_m': 60.1}, {'model': 'Airbus A321XLR', 'adet': 1, 'koltuk': 155, 'menzil_km': 8700, 'mtow_kg': 101000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}]},
    'AS': {'name': 'Alaska Airlines', 'fleet': [{'model': 'Boeing 737-700', 'adet': 14, 'koltuk': 143, 'menzil_km': 3150, 'mtow_kg': 70080, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737-800', 'adet': 61, 'koltuk': 160, 'menzil_km': 3300, 'mtow_kg': 79000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737-900ER', 'adet': 79, 'koltuk': 178, 'menzil_km': 3600, 'mtow_kg': 85130, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737 MAX 8', 'adet': 9, 'koltuk': 160, 'menzil_km': 3900, 'mtow_kg': 82190, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 737 MAX 9', 'adet': 80, 'koltuk': 178, 'menzil_km': 4100, 'mtow_kg': 88315, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}, {'model': 'Embraer 175', 'adet': 89, 'koltuk': 76, 'menzil_km': 2000, 'mtow_kg': 37900, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 26.0}]},
    'B6': {'name': 'JetBlue Airways', 'fleet': [{'model': 'Airbus A220-300', 'adet': 54, 'koltuk': 140, 'menzil_km': 3400, 'mtow_kg': 70900, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.1}, {'model': 'Airbus A320-200', 'adet': 125, 'koltuk': 150, 'menzil_km': 3300, 'mtow_kg': 78000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321-200', 'adet': 63, 'koltuk': 159, 'menzil_km': 3700, 'mtow_kg': 93500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321LR', 'adet': 7, 'koltuk': 138, 'menzil_km': 5200, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Airbus A321neo', 'adet': 37, 'koltuk': 160, 'menzil_km': 5200, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}]},
    'DL': {'name': 'Delta Air Lines', 'fleet': [{'model': 'Airbus A220-100', 'adet': 45, 'koltuk': 125, 'menzil_km': 3400, 'mtow_kg': 63100, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.1}, {'model': 'Airbus A220-300', 'adet': 34, 'koltuk': 135, 'menzil_km': 3400, 'mtow_kg': 70900, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.1}, {'model': 'Airbus A319-100', 'adet': 57, 'koltuk': 134, 'menzil_km': 3700, 'mtow_kg': 75500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A320-200', 'adet': 48, 'koltuk': 155, 'menzil_km': 3700, 'mtow_kg': 78000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321-200', 'adet': 127, 'koltuk': 185, 'menzil_km': 3700, 'mtow_kg': 93500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321neo', 'adet': 84, 'koltuk': 185, 'menzil_km': 3700, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 717-200', 'adet': 80, 'koltuk': 117, 'menzil_km': 2000, 'mtow_kg': 52390, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 28.4}, {'model': 'Boeing 757-200', 'adet': 82, 'koltuk': 170, 'menzil_km': 7200, 'mtow_kg': 115680, 'pilot_sayisi': 2, 'kabin_ekibi': 7, 'kanat_acikligi_m': 38.1}, {'model': 'Boeing 757-300', 'adet': 16, 'koltuk': 210, 'menzil_km': 7200, 'mtow_kg': 124740, 'pilot_sayisi': 2, 'kabin_ekibi': 7, 'kanat_acikligi_m': 38.1}, {'model': 'Boeing 767-300ER', 'adet': 38, 'koltuk': 230, 'menzil_km': 11000, 'mtow_kg': 186880, 'pilot_sayisi': 2, 'kabin_ekibi': 8, 'kanat_acikligi_m': 47.6}, {'model': 'Boeing 767-400ER', 'adet': 21, 'koltuk': 255, 'menzil_km': 11000, 'mtow_kg': 204120, 'pilot_sayisi': 2, 'kabin_ekibi': 8, 'kanat_acikligi_m': 51.9}]},
    'F9': {'name': 'Frontier Airlines', 'fleet': [{'model': 'Airbus A320-200', 'adet': 6, 'koltuk': 180, 'menzil_km': 3700, 'mtow_kg': 78000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A320neo', 'adet': 82, 'koltuk': 186, 'menzil_km': 3700, 'mtow_kg': 79000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Airbus A321-200', 'adet': 21, 'koltuk': 230, 'menzil_km': 3700, 'mtow_kg': 93500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321neo', 'adet': 54, 'koltuk': 240, 'menzil_km': 3700, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}]},
    'G4': {'name': 'Allegiant Air', 'fleet': [{'model': 'Airbus A319-100', 'adet': 31, 'koltuk': 140, 'menzil_km': 3700, 'mtow_kg': 75500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A320-200', 'adet': 75, 'koltuk': 168, 'menzil_km': 3700, 'mtow_kg': 78000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Boeing 737 MAX 7', 'adet': 16, 'koltuk': 155, 'menzil_km': 4000, 'mtow_kg': 80300, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}]},
    'HA': {'name': 'Hawaiian Airlines', 'fleet': [{'model': 'Airbus A321neo', 'adet': 18, 'koltuk': 200, 'menzil_km': 6850, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Airbus A330-200', 'adet': 24, 'koltuk': 264, 'menzil_km': 11750, 'mtow_kg': 242000, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.3}, {'model': 'Boeing 717-200', 'adet': 19, 'koltuk': 119, 'menzil_km': 3000, 'mtow_kg': 52400, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 28.4}, {'model': 'Boeing 787-9', 'adet': 4, 'koltuk': 312, 'menzil_km': 14140, 'mtow_kg': 254000, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.1}, {'model': 'Airbus A330-300', 'adet': 10, 'koltuk': 250, 'menzil_km': 11750, 'mtow_kg': 242000, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.3}]},
    'MQ': {'name': 'Envoy Air', 'fleet': [{'model': 'Embraer 170', 'adet': 43, 'koltuk': 70, 'menzil_km': 2400, 'mtow_kg': 37200, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 26.0}, {'model': 'Embraer 175', 'adet': 126, 'koltuk': 82, 'menzil_km': 2250, 'mtow_kg': 40800, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 26.0}]},
    'NK': {'name': 'Spirit Airlines', 'fleet': [{'model': 'Airbus A320-200', 'adet': 31, 'koltuk': 181, 'menzil_km': 3700, 'mtow_kg': 78000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A320neo', 'adet': 27, 'koltuk': 184, 'menzil_km': 6300, 'mtow_kg': 79000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Airbus A321-200', 'adet': 22, 'koltuk': 228, 'menzil_km': 5950, 'mtow_kg': 93500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321neo', 'adet': 29, 'koltuk': 235, 'menzil_km': 7400, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}]},
    'OH': {'name': 'PSA Airlines', 'fleet': [{'model': 'Bombardier CRJ-900', 'adet': 88, 'koltuk': 76, 'menzil_km': 2400, 'mtow_kg': 36360, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 24.85}, {'model': 'Bombardier CRJ-700', 'adet': 60, 'koltuk': 72, 'menzil_km': 2400, 'mtow_kg': 34000, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 24.85}]},
    'OO': {'name': 'SkyWest Airlines', 'fleet': [{'model': 'Bombardier CRJ-100 Series', 'adet': 130, 'koltuk': 51, 'menzil_km': 2400, 'mtow_kg': 24040, 'pilot_sayisi': 2, 'kabin_ekibi': 2, 'kanat_acikligi_m': 21.21}, {'model': 'Bombardier CRJ-700', 'adet': 137, 'koltuk': 74, 'menzil_km': 2400, 'mtow_kg': 34000, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 23.2}, {'model': 'Bombardier CRJ-900', 'adet': 57, 'koltuk': 83, 'menzil_km': 2400, 'mtow_kg': 36360, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 24.85}, {'model': 'Embraer 170', 'adet': 265, 'koltuk': 71, 'menzil_km': 2400, 'mtow_kg': 37200, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 26.0}]},
    'UA': {'name': 'United Airlines', 'fleet': [{'model': 'Airbus A319-100', 'adet': 81, 'koltuk': 138, 'menzil_km': 6850, 'mtow_kg': 75500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A320-200', 'adet': 72, 'koltuk': 156, 'menzil_km': 6150, 'mtow_kg': 77000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321neo', 'adet': 48, 'koltuk': 189, 'menzil_km': 7400, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 6, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737-700', 'adet': 40, 'koltuk': 126, 'menzil_km': 6000, 'mtow_kg': 70000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 737-800', 'adet': 140, 'koltuk': 166, 'menzil_km': 5400, 'mtow_kg': 79000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 737-900ER', 'adet': 136, 'koltuk': 179, 'menzil_km': 5900, 'mtow_kg': 85100, 'pilot_sayisi': 2, 'kabin_ekibi': 6, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 737 MAX 8', 'adet': 123, 'koltuk': 166, 'menzil_km': 6570, 'mtow_kg': 82200, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 737 MAX 9', 'adet': 113, 'koltuk': 179, 'menzil_km': 6570, 'mtow_kg': 88300, 'pilot_sayisi': 2, 'kabin_ekibi': 6, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 757-200', 'adet': 40, 'koltuk': 176, 'menzil_km': 7200, 'mtow_kg': 115600, 'pilot_sayisi': 2, 'kabin_ekibi': 7, 'kanat_acikligi_m': 38.0}, {'model': 'Boeing 767-300ER', 'adet': 37, 'koltuk': 199, 'menzil_km': 11000, 'mtow_kg': 186900, 'pilot_sayisi': 2, 'kabin_ekibi': 9, 'kanat_acikligi_m': 47.6}, {'model': 'Boeing 777-200ER', 'adet': 53, 'koltuk': 276, 'menzil_km': 13080, 'mtow_kg': 297500, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.9}, {'model': 'Boeing 777-300ER', 'adet': 22, 'koltuk': 362, 'menzil_km': 13650, 'mtow_kg': 351500, 'pilot_sayisi': 2, 'kabin_ekibi': 12, 'kanat_acikligi_m': 64.8}, {'model': 'Boeing 787-8', 'adet': 12, 'koltuk': 243, 'menzil_km': 13620, 'mtow_kg': 227900, 'pilot_sayisi': 2, 'kabin_ekibi': 9, 'kanat_acikligi_m': 60.1}, {'model': 'Boeing 787-9', 'adet': 46, 'koltuk': 296, 'menzil_km': 14010, 'mtow_kg': 254000, 'pilot_sayisi': 2, 'kabin_ekibi': 9, 'kanat_acikligi_m': 60.1}, {'model': 'Boeing 787-10', 'adet': 21, 'koltuk': 318, 'menzil_km': 11910, 'mtow_kg': 254000, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.1}]},
    'WN': {'name': 'Southwest Airlines', 'fleet': [{'model': 'Boeing 737-700', 'adet': 334, 'koltuk': 143, 'menzil_km': 3700, 'mtow_kg': 74000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737-800', 'adet': 203, 'koltuk': 175, 'menzil_km': 3700, 'mtow_kg': 79000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737 MAX 8', 'adet': 273, 'koltuk': 175, 'menzil_km': 5000, 'mtow_kg': 82190, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}]},
    'YV': {'name': 'Mesa Airlines', 'fleet': [{'model': 'Embraer 175', 'adet': 43, 'koltuk': 82, 'menzil_km': 2950, 'mtow_kg': 38500, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 26.0}]},
    'YX': {'name': 'Republic Airways', 'fleet': [{'model': 'Embraer 170', 'adet': 31, 'koltuk': 79, 'menzil_km': 2850, 'mtow_kg': 38000, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 26.0}, {'model': 'Embraer 175', 'adet': 185, 'koltuk': 79, 'menzil_km': 2850, 'mtow_kg': 38000, 'pilot_sayisi': 2, 'kabin_ekibi': 4, 'kanat_acikligi_m': 26.0}]},
    'TK': {'name': 'Turkish Airlines', 'fleet': [{'model': 'Airbus A319-100', 'adet': 129, 'koltuk': 132, 'menzil_km': 6850, 'mtow_kg': 75500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A320-200', 'adet': 150, 'koltuk': 180, 'menzil_km': 6300, 'mtow_kg': 78000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321-200', 'adet': 203, 'koltuk': 220, 'menzil_km': 5950, 'mtow_kg': 93500, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 34.1}, {'model': 'Airbus A321neo', 'adet': 74, 'koltuk': 220, 'menzil_km': 7400, 'mtow_kg': 97000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737-800', 'adet': 303, 'koltuk': 189, 'menzil_km': 5500, 'mtow_kg': 79000, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.8}, {'model': 'Boeing 737 MAX 8', 'adet': 81, 'koltuk': 189, 'menzil_km': 6570, 'mtow_kg': 82190, 'pilot_sayisi': 2, 'kabin_ekibi': 5, 'kanat_acikligi_m': 35.9}, {'model': 'Boeing 777-200ER', 'adet': 132, 'koltuk': 314, 'menzil_km': 13650, 'mtow_kg': 297500, 'pilot_sayisi': 2, 'kabin_ekibi': 13, 'kanat_acikligi_m': 60.9}, {'model': 'Boeing 777-300ER', 'adet': 115, 'koltuk': 396, 'menzil_km': 13650, 'mtow_kg': 351500, 'pilot_sayisi': 2, 'kabin_ekibi': 13, 'kanat_acikligi_m': 64.8}, {'model': 'Boeing 787-8', 'adet': 70, 'koltuk': 270, 'menzil_km': 14140, 'mtow_kg': 227930, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.1}, {'model': 'Boeing 787-9', 'adet': 51, 'koltuk': 296, 'menzil_km': 14140, 'mtow_kg': 254000, 'pilot_sayisi': 2, 'kabin_ekibi': 10, 'kanat_acikligi_m': 60.1}]}
}



def create_fleet_database():
    all_aircraft_list = []
    for code, airline_info in master_filo_data.items():
        airline_name = airline_info['name']
        for aircraft in airline_info['fleet']:
            model = aircraft.get('model')
            flat_aircraft_record = {
                'Havayolu Kodu': code,
                'Havayolu Adı': airline_name,
                'Uçak Tipi': model,
                'Filodaki Adet': aircraft.get('adet'),
                'Koltuk Sayısı': aircraft.get('koltuk'),
                'Menzil (km)': aircraft.get('menzil_km'),
                'Maksimum Kalkış Ağırlığı (kg)': aircraft.get('mtow_kg'),
                'Pilot Sayısı': aircraft.get('pilot_sayisi'),
                'Kabin Ekibi Sayısı': aircraft.get('kabin_ekibi'),
                'Kanat Açıklığı (m)': aircraft.get('kanat_acikligi_m'),
                'model_path': model_map.get(model)
            }
            all_aircraft_list.append(flat_aircraft_record)

    df = pd.DataFrame(all_aircraft_list)
    
    output_filename_excel = 'havayolu_filo_veritabani.xlsx'
    output_filename_json = os.path.join('data', 'havayolu_filo_veritabani.json') 


    if not os.path.exists('data'):
        os.makedirs('data')

    try:
        df.to_excel(output_filename_excel, index=False, engine='xlsxwriter')
        print(f"Excel veritabanı başarıyla '{output_filename_excel}' dosyasına kaydedildi.")
        

        df.to_json(output_filename_json, orient='records', indent=4, force_ascii=False)
        print(f"JSON veritabanı başarıyla '{output_filename_json}' dosyasına kaydedildi.")

    except Exception as e:
        print(f"Dosya kaydedilirken bir hata oluştu: {e}")

if __name__ == "__main__":

    if not master_filo_data:
         print("Lütfen 'master_filo_data' değişkenini bir önceki adımdaki filo verileriyle doldurun.")
    else:
        create_fleet_database()