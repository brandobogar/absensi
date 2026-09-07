import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function PetaModal({ visible, koordinatAwal, onSimpan, onBatal }) {
  const defaultKoordinat = koordinatAwal || { latitude: 3.6096906, longitude: 125.5056118 };

  const [markerPos, setMarkerPos] = useState(defaultKoordinat);
  const [region, setRegion] = useState({
    latitude: defaultKoordinat.latitude,
    longitude: defaultKoordinat.longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });
  const [loadingLokasi, setLoadingLokasi] = useState(false);

  const keLokasiSaya = async () => {
    setLoadingLokasi(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Izin lokasi diperlukan!');
      setLoadingLokasi(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const newPos = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    setMarkerPos(newPos);
    setRegion({ ...newPos, latitudeDelta: 0.002, longitudeDelta: 0.002 });
    setLoadingLokasi(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onBatal}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBatal}>
            <Text style={styles.batalText}>✕ Batal</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pilih Lokasi Kantor</Text>
          <TouchableOpacity onPress={() => onSimpan(markerPos)}>
            <Text style={styles.simpanText}>Simpan ✓</Text>
          </TouchableOpacity>
        </View>

        {/* PETA */}
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={(e) => setMarkerPos(e.nativeEvent.coordinate)}
        >
          <Marker
            coordinate={markerPos}
            draggable
            onDragEnd={(e) => setMarkerPos(e.nativeEvent.coordinate)}
            title="Titik Kantor"
            description="Geser untuk pindah lokasi"
          />
        </MapView>

        {/* INFO KOORDINAT */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📍 Koordinat Dipilih:</Text>
          <Text style={styles.infoText}>Lat: {markerPos.latitude.toFixed(7)}</Text>
          <Text style={styles.infoText}>Lng: {markerPos.longitude.toFixed(7)}</Text>

          <TouchableOpacity
            style={styles.lokasiButton}
            onPress={keLokasiSaya}
            disabled={loadingLokasi}
          >
            {loadingLokasi ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.lokasiButtonText}>🎯 Ke Lokasi Saya</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 3,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  batalText: { fontSize: 14, color: '#e74c3c', fontWeight: '600' },
  simpanText: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  map: { flex: 1 },
  infoBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    elevation: 5,
  },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  lokasiButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  lokasiButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});