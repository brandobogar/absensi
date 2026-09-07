import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { callApi } from "../api";

export default function RiwayatScreen({ userData }) {
  // Tanggal default awal bulan sampai hari ini
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [dari, setDari] = useState(`${yyyy}-${mm}-01`);
  const [sampai, setSampai] = useState(`${yyyy}-${mm}-${dd}`);
  const [riwayatData, setRiwayatData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCariRiwayat = async () => {
    setLoading(true);
    const res = await callApi("getRiwayat", {
      nama: userData.nama,
      tanggalMulai: dari,
      tanggalSelesai: sampai,
    });
    setLoading(false);
    if (Array.isArray(res)) {
      setRiwayatData(res);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Riwayat Absensi</Text>
        <Text style={styles.subtitle}>{userData?.nama}</Text>

        <Text style={styles.label}>Dari Tanggal</Text>
        <TextInput
          style={styles.input}
          value={dari}
          onChangeText={setDari}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Sampai Tanggal</Text>
        <TextInput
          style={styles.input}
          value={sampai}
          onChangeText={setSampai}
          placeholder="YYYY-MM-DD"
        />

        <TouchableOpacity style={styles.button} onPress={handleCariRiwayat}>
          <Text style={styles.buttonText}>
            {loading ? "Memuat..." : "🔍 Cari Riwayat"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Hasil Riwayat</Text>
        {riwayatData.length === 0 ? (
          <Text style={styles.emptyText}>
            Belum ada data atau belum dicari.
          </Text>
        ) : (
          riwayatData.map((row, index) => (
            <View key={index} style={styles.rowItem}>
              <View>
                <Text style={styles.rowDate}>
                  {new Date(row[0]).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.rowSesi}>Sesi: {row[2]}</Text>
              </View>
              <Text
                style={[
                  styles.rowStatus,
                  row[6] === "APPROVED" ? styles.success : styles.danger,
                ]}
              >
                {row[6]}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  label: { fontSize: 13, fontWeight: "500", color: "#374151", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    marginVertical: 10,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rowDate: { fontSize: 13, fontWeight: "600", color: "#1f2937" },
  rowSesi: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  rowStatus: { fontSize: 12, fontWeight: "bold" },
  success: { color: "#16a34a" },
  danger: { color: "#dc2626" },
});
