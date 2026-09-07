import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import PetaModal from "../components/PetaModal";
import SesiModal from "../components/SesiModal";

// Helper konversi
const menitKeJam = (menit) => {
  const j = Math.floor(menit / 60);
  const m = menit % 60;
  return `${String(j).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const jamKeMenit = (jamStr) => {
  if (!jamStr || !jamStr.includes(":")) return parseInt(jamStr) || 0;
  const [j, m] = jamStr.split(":").map(Number);
  return (j || 0) * 60 + (m || 0);
};

// Komponen SesiRow
const SesiRow = ({ label, mulai, selesai, onUbah }) => (
  <View style={styles.sesiRow}>
    <View>
      <Text style={styles.sesiRowLabel}>{label}</Text>
      <Text style={styles.sesiRowJam}>
        {menitKeJam(mulai)} - {menitKeJam(selesai)}
      </Text>
    </View>
    <TouchableOpacity style={styles.ubahButton} onPress={onUbah}>
      <Text style={styles.ubahButtonText}>Ubah</Text>
    </TouchableOpacity>
  </View>
);

export default function AdminScreen({ onLogout, callApi }) {
  const [absensiList, setAbsensiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Radius
  const [radius, setRadius] = useState("");
  const [savingRadius, setSavingRadius] = useState(false);

  // Lokasi
  const [showPeta, setShowPeta] = useState(false);
  const [koordinatKantor, setKoordinatKantor] = useState(null);
  const [savingLokasi, setSavingLokasi] = useState(false);

  // Jam sesi
  const [jamSesi, setJamSesi] = useState({
    senin_masuk_mulai: 420,
    senin_masuk_selesai: 540,
    senin_istirahat_mulai: 750,
    senin_istirahat_selesai: 840,
    senin_pulang_mulai: 1020,
    senin_pulang_selesai: 1200,
    jumat_masuk_mulai: 390,
    jumat_masuk_selesai: 510,
    jumat_istirahat_mulai: 780,
    jumat_istirahat_selesai: 870,
    jumat_pulang_mulai: 1020,
    jumat_pulang_selesai: 1200,
  });

  // Modal sesi
  const [modalSesi, setModalSesi] = useState({
    visible: false,
    sesi: null,
    keyMulai: "",
    keySelesai: "",
  });
  const [savingJam, setSavingJam] = useState(false);

  const fetchAbsensiAdmin = async () => {
    setLoading(true);
    try {
      const data = await callApi("getAbsensiAdmin", {});
      setAbsensiList(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Error", "Gagal memuat data absensi admin.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    const result = await callApi("getConfig", {});
    if (result) {
      if (result.radius) setRadius(String(result.radius));
      if (result.kantorLat && result.kantorLng) {
        setKoordinatKantor({
          latitude: parseFloat(result.kantorLat),
          longitude: parseFloat(result.kantorLng),
        });
      }
      setJamSesi({
        senin_masuk_mulai: parseInt(result.senin_masuk_mulai || 420),
        senin_masuk_selesai: parseInt(result.senin_masuk_selesai || 540),
        senin_istirahat_mulai: parseInt(result.senin_istirahat_mulai || 750),
        senin_istirahat_selesai: parseInt(
          result.senin_istirahat_selesai || 840,
        ),
        senin_pulang_mulai: parseInt(result.senin_pulang_mulai || 1020),
        senin_pulang_selesai: parseInt(result.senin_pulang_selesai || 1200),
        jumat_masuk_mulai: parseInt(result.jumat_masuk_mulai || 390),
        jumat_masuk_selesai: parseInt(result.jumat_masuk_selesai || 510),
        jumat_istirahat_mulai: parseInt(result.jumat_istirahat_mulai || 780),
        jumat_istirahat_selesai: parseInt(
          result.jumat_istirahat_selesai || 870,
        ),
        jumat_pulang_mulai: parseInt(result.jumat_pulang_mulai || 1020),
        jumat_pulang_selesai: parseInt(result.jumat_pulang_selesai || 1200),
      });
    }
  };

  useEffect(() => {
    fetchAbsensiAdmin();
    fetchConfig();
  }, []);

  // HANDLER RADIUS
  const handleSimpanRadius = async () => {
    if (!radius || isNaN(radius)) {
      Alert.alert("Error", "Masukkan nilai radius yang valid!");
      return;
    }
    Alert.alert("Konfirmasi", `Ubah radius menjadi ${radius} meter?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Simpan",
        onPress: async () => {
          setSavingRadius(true);
          const result = await callApi("updateConfig", {
            key: "radius",
            value: parseFloat(radius),
          });
          setSavingRadius(false);
          if (result?.status === "berhasil") {
            Alert.alert(
              "Sukses",
              `Radius berhasil diubah menjadi ${radius} meter!`,
            );
          } else {
            Alert.alert("Gagal", "Gagal mengubah radius.");
          }
        },
      },
    ]);
  };

  // HANDLER LOKASI
  const handleSimpanLokasi = async (koordinat) => {
    setShowPeta(false);
    setSavingLokasi(true);
    const r1 = await callApi("updateConfig", {
      key: "kantorLat",
      value: koordinat.latitude,
    });
    const r2 = await callApi("updateConfig", {
      key: "kantorLng",
      value: koordinat.longitude,
    });
    setSavingLokasi(false);
    if (r1?.status === "berhasil" && r2?.status === "berhasil") {
      setKoordinatKantor(koordinat);
      Alert.alert("Sukses", "Titik lokasi kantor berhasil diperbarui!");
    } else {
      Alert.alert("Gagal", "Gagal menyimpan lokasi kantor.");
    }
  };

  // HANDLER SESI
  const bukaModalSesi = (hari, label, keyMulai, keySelesai) => {
    setModalSesi({
      visible: true,
      sesi: {
        hari,
        label,
        mulai: jamSesi[keyMulai],
        selesai: jamSesi[keySelesai],
      },
      keyMulai,
      keySelesai,
    });
  };

  const handleSimpanSesi = async ({ mulai, selesai }) => {
    setModalSesi((prev) => ({ ...prev, visible: false }));
    setSavingJam(true);

    const r1 = await callApi("updateConfig", {
      key: modalSesi.keyMulai,
      value: mulai,
    });
    const r2 = await callApi("updateConfig", {
      key: modalSesi.keySelesai,
      value: selesai,
    });

    setSavingJam(false);

    if (r1?.status === "berhasil" && r2?.status === "berhasil") {
      setJamSesi((prev) => ({
        ...prev,
        [modalSesi.keyMulai]: mulai,
        [modalSesi.keySelesai]: selesai,
      }));
      Alert.alert("Sukses", "Jam sesi berhasil diperbarui!");
    } else {
      Alert.alert("Gagal", "Gagal menyimpan jam sesi.");
    }
  };

  // HANDLER EXPORT
  const handleExport = async () => {
    setExporting(true);
    try {
      const sekarang = new Date();
      const result = await callApi("exportRekap", {
        bulan: sekarang.getMonth() + 1,
        tahun: sekarang.getFullYear(),
      });
      if (result?.status === "berhasil") {
        Alert.alert(
          "Sukses",
          `File rekap berhasil dibuat:\n${result.namaFile}`,
        );
      } else {
        Alert.alert("Gagal", "Gagal mengeksport rekap bulanan.");
      }
    } catch (error) {
      Alert.alert("Error", "Terjadi kesalahan saat mengeksport data.");
    } finally {
      setExporting(false);
    }
  };

  const totalAbsen = absensiList.length;
  const totalApproved = absensiList.filter(
    (item) => item[6] === "APPROVED",
  ).length;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAbsensiAdmin} />
        }
      >
        {/* HEADER */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.headerTitle}>Dashboard Admin</Text>
            <Text style={styles.headerSubtitle}>
              Sistem Absensi PPPK Inspektorat
            </Text>
          </View>
        </View>

        {/* STATISTIK */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalAbsen}</Text>
            <Text style={styles.statLabel}>Absen Hari Ini</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#2ecc71" }]}>
              {totalApproved}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        {/* DAFTAR ABSENSI */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Absensi Hari Ini</Text>
            <TouchableOpacity
              onPress={fetchAbsensiAdmin}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={14} color="#007AFF" />
              <Text style={styles.refreshText}> Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading && absensiList.length === 0 ? (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={{ marginVertical: 20 }}
            />
          ) : absensiList.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada absensi hari ini</Text>
          ) : (
            absensiList.map((item, index) => {
              const tgl = new Date(item[0]);
              const jamStr = tgl.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const tglStr = tgl.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
              });
              const isApproved = item[6] === "APPROVED";
              return (
                <View key={index} style={styles.absenItem}>
                  <View>
                    <Text style={styles.absenNama}>{item[1]}</Text>
                    <Text style={styles.absenDetail}>
                      {tglStr}, {jamStr} • Sesi: {item[2]}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.absenStatus,
                      { color: isApproved ? "#2ecc71" : "#e74c3c" },
                    ]}
                  >
                    {item[6]}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* PENGATURAN RADIUS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>⚙️ Pengaturan Radius</Text>
          <Text style={styles.settingDesc}>
            Atur jarak maksimal pegawai dari titik kantor untuk dapat melakukan
            absen.
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputRadius}
              value={radius}
              onChangeText={setRadius}
              keyboardType="numeric"
              placeholder="Contoh: 50"
            />
            <Text style={styles.inputSatuan}>meter</Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSimpanRadius}
            disabled={savingRadius}
          >
            {savingRadius ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>💾 Simpan Radius</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* PENGATURAN LOKASI */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📍 Titik Lokasi Kantor</Text>
          <Text style={styles.settingDesc}>
            Atur titik koordinat kantor sebagai pusat radius absensi.
          </Text>
          {koordinatKantor && (
            <View style={styles.koordinatBox}>
              <Text style={styles.koordinatText}>
                Lat: {koordinatKantor.latitude.toFixed(7)}
              </Text>
              <Text style={styles.koordinatText}>
                Lng: {koordinatKantor.longitude.toFixed(7)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setShowPeta(true)}
            disabled={savingLokasi}
          >
            {savingLokasi ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>🗺️ Pilih di Peta</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* PENGATURAN JAM SESI */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🕐 Pengaturan Jam Sesi</Text>
          {savingJam && (
            <ActivityIndicator
              size="small"
              color="#2563eb"
              style={{ marginBottom: 8 }}
            />
          )}

          <Text style={styles.hariTitle}>Senin - Kamis</Text>
          <SesiRow
            label="Masuk"
            mulai={jamSesi.senin_masuk_mulai}
            selesai={jamSesi.senin_masuk_selesai}
            onUbah={() =>
              bukaModalSesi(
                "Senin - Kamis",
                "Masuk",
                "senin_masuk_mulai",
                "senin_masuk_selesai",
              )
            }
          />
          <SesiRow
            label="Istirahat"
            mulai={jamSesi.senin_istirahat_mulai}
            selesai={jamSesi.senin_istirahat_selesai}
            onUbah={() =>
              bukaModalSesi(
                "Senin - Kamis",
                "Istirahat",
                "senin_istirahat_mulai",
                "senin_istirahat_selesai",
              )
            }
          />
          <SesiRow
            label="Pulang"
            mulai={jamSesi.senin_pulang_mulai}
            selesai={jamSesi.senin_pulang_selesai}
            onUbah={() =>
              bukaModalSesi(
                "Senin - Kamis",
                "Pulang",
                "senin_pulang_mulai",
                "senin_pulang_selesai",
              )
            }
          />

          <Text style={[styles.hariTitle, { marginTop: 12 }]}>Jumat</Text>
          <SesiRow
            label="Masuk"
            mulai={jamSesi.jumat_masuk_mulai}
            selesai={jamSesi.jumat_masuk_selesai}
            onUbah={() =>
              bukaModalSesi(
                "Jumat",
                "Masuk",
                "jumat_masuk_mulai",
                "jumat_masuk_selesai",
              )
            }
          />
          <SesiRow
            label="Istirahat"
            mulai={jamSesi.jumat_istirahat_mulai}
            selesai={jamSesi.jumat_istirahat_selesai}
            onUbah={() =>
              bukaModalSesi(
                "Jumat",
                "Istirahat",
                "jumat_istirahat_mulai",
                "jumat_istirahat_selesai",
              )
            }
          />
          <SesiRow
            label="Pulang"
            mulai={jamSesi.jumat_pulang_mulai}
            selesai={jamSesi.jumat_pulang_selesai}
            onUbah={() =>
              bukaModalSesi(
                "Jumat",
                "Pulang",
                "jumat_pulang_mulai",
                "jumat_pulang_selesai",
              )
            }
          />
        </View>

        {/* AKSI */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Aksi</Text>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="file-excel"
                  size={20}
                  color="#ffffff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.exportButtonText}>
                  Export Rekap Bulan Ini
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButtonBottom}
            onPress={onLogout}
          >
            <Text style={styles.logoutButtonBottomText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL PETA */}
      <PetaModal
        visible={showPeta}
        koordinatAwal={koordinatKantor}
        onSimpan={handleSimpanLokasi}
        onBatal={() => setShowPeta(false)}
      />

      {/* MODAL SESI */}
      <SesiModal
        visible={modalSesi.visible}
        sesi={modalSesi.sesi}
        onSimpan={handleSimpanSesi}
        onBatal={() => setModalSesi((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  contentContainer: { padding: 20, paddingTop: 40 },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#2c3e50" },
  headerSubtitle: { fontSize: 12, color: "#7f8c8d", marginTop: 2 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    alignItems: "center",
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: "#7f8c8d", fontWeight: "500" },
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  refreshButton: { flexDirection: "row", alignItems: "center" },
  refreshText: { fontSize: 12, color: "#007AFF", fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    color: "#95a5a6",
    marginVertical: 20,
    fontSize: 13,
  },
  absenItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  absenNama: { fontSize: 14, fontWeight: "600", color: "#2c3e50" },
  absenDetail: { fontSize: 11, color: "#7f8c8d", marginTop: 2 },
  absenStatus: { fontSize: 12, fontWeight: "bold" },
  settingDesc: { fontSize: 12, color: "#7f8c8d", marginBottom: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  inputRadius: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#f9fafb",
    marginRight: 8,
  },
  inputSatuan: { fontSize: 14, color: "#6b7280", fontWeight: "500" },
  saveButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  exportButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  exportButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "bold" },
  logoutButtonBottom: {
    backgroundColor: "#f1f2f6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutButtonBottomText: {
    color: "#e74c3c",
    fontSize: 14,
    fontWeight: "bold",
  },
  koordinatBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  koordinatText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  hariTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 8,
    marginTop: 4,
  },
  sesiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  sesiRowLabel: { fontSize: 13, fontWeight: "600", color: "#2c3e50" },
  sesiRowJam: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  ubahButton: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  ubahButtonText: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
});
