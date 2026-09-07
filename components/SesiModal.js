import React, { useState, useEffect } from "react";

import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

// ============================================================
// KONVERSI TOTAL MENIT → JAM & MENIT
// ============================================================
const menitKeJam = (totalMenit) => {
  const j = Math.floor(totalMenit / 60);
  const m = totalMenit % 60;

  return {
    jam: String(j).padStart(2, "0"),
    menit: String(m).padStart(2, "0"),
  };
};

// ============================================================
// INPUT WAKTU
// Diletakkan DI LUAR SesiModal agar TextInput tidak
// dibuat ulang setiap kali state berubah.
// ============================================================
const InputWaktu = ({ labelJam, jam, setJam, menit, setMenit }) => {
  // ----------------------------------------------------------
  // PERUBAHAN INPUT JAM
  // ----------------------------------------------------------
  const handleJamChange = (text) => {
    // Hanya angka
    const angka = text.replace(/\D/g, "").substring(0, 2);

    // Izinkan kosong ketika user menghapus
    if (angka === "") {
      setJam("");
      return;
    }

    const nilai = parseInt(angka, 10);

    // Maksimum jam = 23
    if (nilai > 23) {
      setJam("23");
      return;
    }

    setJam(angka);
  };

  // ----------------------------------------------------------
  // PERUBAHAN INPUT MENIT
  // ----------------------------------------------------------
  const handleMenitChange = (text) => {
    // Hanya angka
    const angka = text.replace(/\D/g, "").substring(0, 2);

    // Izinkan kosong ketika user menghapus
    if (angka === "") {
      setMenit("");
      return;
    }

    const nilai = parseInt(angka, 10);

    // Maksimum menit = 59
    if (nilai > 59) {
      setMenit("59");
      return;
    }

    setMenit(angka);
  };

  // ----------------------------------------------------------
  // FORMAT SAAT SELESAI EDIT
  // 7  → 07
  // 8  → 08
  // 17 → 17
  // ----------------------------------------------------------
  const formatJam = () => {
    if (jam !== "") {
      setJam(jam.padStart(2, "0"));
    }
  };

  const formatMenit = () => {
    if (menit !== "") {
      setMenit(menit.padStart(2, "0"));
    }
  };

  return (
    <View>
      <Text style={styles.label}>{labelJam}</Text>

      <View style={styles.waktuRow}>
        {/* ==================================================
            JAM
        ================================================== */}
        <TextInput
          style={styles.inputWaktu}
          value={jam}
          onChangeText={handleJamChange}
          onBlur={formatJam}
          keyboardType="numeric"
          maxLength={2}
          selectTextOnFocus
          placeholder="00"
          textAlign="center"
          returnKeyType="next"
        />

        <Text style={styles.separator}>:</Text>

        {/* ==================================================
            MENIT
        ================================================== */}
        <TextInput
          style={styles.inputWaktu}
          value={menit}
          onChangeText={handleMenitChange}
          onBlur={formatMenit}
          keyboardType="numeric"
          maxLength={2}
          selectTextOnFocus
          placeholder="00"
          textAlign="center"
          returnKeyType="done"
        />
      </View>
    </View>
  );
};

// ============================================================
// SESI MODAL
// ============================================================
export default function SesiModal({ visible, sesi, onSimpan, onBatal }) {
  const [mulaiJam, setMulaiJam] = useState("07");

  const [mulaiMenit, setMulaiMenit] = useState("00");

  const [selesaiJam, setSelesaiJam] = useState("09");

  const [selesaiMenit, setSelesaiMenit] = useState("00");

  // ==========================================================
  // LOAD DATA SESI
  // ==========================================================
  useEffect(() => {
    if (visible && sesi) {
      const m = menitKeJam(sesi.mulai || 0);

      const s = menitKeJam(sesi.selesai || 0);

      setMulaiJam(m.jam);

      setMulaiMenit(m.menit);

      setSelesaiJam(s.jam);

      setSelesaiMenit(s.menit);
    }
  }, [visible, sesi]);

  // ==========================================================
  // SIMPAN
  // ==========================================================
  const handleSimpan = () => {
    // --------------------------------------------------------
    // Pastikan semua field terisi
    // --------------------------------------------------------
    if (
      mulaiJam === "" ||
      mulaiMenit === "" ||
      selesaiJam === "" ||
      selesaiMenit === ""
    ) {
      Alert.alert("Input Tidak Lengkap", "Jam dan menit harus diisi.");

      return;
    }

    // --------------------------------------------------------
    // KONVERSI KE ANGKA
    // --------------------------------------------------------
    const jamMulai = parseInt(mulaiJam, 10);

    const menitMulai = parseInt(mulaiMenit, 10);

    const jamSelesai = parseInt(selesaiJam, 10);

    const menitSelesai = parseInt(selesaiMenit, 10);

    // --------------------------------------------------------
    // VALIDASI JAM MULAI
    // --------------------------------------------------------
    if (isNaN(jamMulai) || jamMulai < 0 || jamMulai > 23) {
      Alert.alert(
        "Jam Tidak Valid",
        "Jam mulai harus berada antara 00 sampai 23.",
      );

      return;
    }

    // --------------------------------------------------------
    // VALIDASI JAM SELESAI
    // --------------------------------------------------------
    if (isNaN(jamSelesai) || jamSelesai < 0 || jamSelesai > 23) {
      Alert.alert(
        "Jam Tidak Valid",
        "Jam selesai harus berada antara 00 sampai 23.",
      );

      return;
    }

    // --------------------------------------------------------
    // VALIDASI MENIT MULAI
    // --------------------------------------------------------
    if (isNaN(menitMulai) || menitMulai < 0 || menitMulai > 59) {
      Alert.alert(
        "Menit Tidak Valid",
        "Menit mulai harus berada antara 00 sampai 59.",
      );

      return;
    }

    // --------------------------------------------------------
    // VALIDASI MENIT SELESAI
    // --------------------------------------------------------
    if (isNaN(menitSelesai) || menitSelesai < 0 || menitSelesai > 59) {
      Alert.alert(
        "Menit Tidak Valid",
        "Menit selesai harus berada antara 00 sampai 59.",
      );

      return;
    }

    // --------------------------------------------------------
    // KONVERSI KE TOTAL MENIT
    // --------------------------------------------------------
    const totalMulai = jamMulai * 60 + menitMulai;

    const totalSelesai = jamSelesai * 60 + menitSelesai;

    // --------------------------------------------------------
    // VALIDASI URUTAN WAKTU
    // --------------------------------------------------------
    if (totalMulai >= totalSelesai) {
      Alert.alert(
        "Waktu Tidak Valid",
        "Jam mulai harus lebih awal dari jam selesai!",
      );

      return;
    }

    // --------------------------------------------------------
    // KIRIM KE ADMINSCREEN
    // Struktur tetap sama dengan kode sebelumnya
    // --------------------------------------------------------
    onSimpan({
      mulai: totalMulai,
      selesai: totalSelesai,
    });
  };

  // ==========================================================
  // RENDER
  // ==========================================================
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onBatal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Ubah Jam {sesi?.label}</Text>

          <Text style={styles.subtitle}>{sesi?.hari}</Text>

          {/* ==================================================
              JAM MULAI
          ================================================== */}
          <InputWaktu
            labelJam="Jam Mulai"
            jam={mulaiJam}
            setJam={setMulaiJam}
            menit={mulaiMenit}
            setMenit={setMulaiMenit}
          />

          <View style={{ height: 16 }} />

          {/* ==================================================
              JAM SELESAI
          ================================================== */}
          <InputWaktu
            labelJam="Jam Selesai"
            jam={selesaiJam}
            setJam={setSelesaiJam}
            menit={selesaiMenit}
            setMenit={setSelesaiMenit}
          />

          {/* ==================================================
              BUTTON
          ================================================== */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.batalButton} onPress={onBatal}>
              <Text style={styles.batalText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simpanButton}
              onPress={handleSimpan}
            >
              <Text style={styles.simpanText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// STYLE
// ============================================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.5)",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,
  },

  modalBox: {
    backgroundColor: "#ffffff",

    borderRadius: 20,

    padding: 24,

    width: "100%",

    elevation: 5,
  },

  title: {
    fontSize: 18,

    fontWeight: "bold",

    color: "#1f2937",

    textAlign: "center",

    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,

    color: "#6b7280",

    textAlign: "center",

    marginBottom: 20,
  },

  label: {
    fontSize: 13,

    fontWeight: "500",

    color: "#374151",

    marginBottom: 8,
  },

  waktuRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 8,
  },

  inputWaktu: {
    borderWidth: 1,

    borderColor: "#d1d5db",

    borderRadius: 10,

    padding: 12,

    fontSize: 28,

    fontWeight: "bold",

    color: "#1f2937",

    backgroundColor: "#f9fafb",

    width: 80,

    textAlign: "center",
  },

  separator: {
    fontSize: 28,

    fontWeight: "bold",

    color: "#374151",
  },

  buttonRow: {
    flexDirection: "row",

    gap: 12,

    marginTop: 20,
  },

  batalButton: {
    flex: 1,

    backgroundColor: "#f1f2f6",

    borderRadius: 12,

    padding: 14,

    alignItems: "center",
  },

  batalText: {
    color: "#6b7280",

    fontWeight: "bold",

    fontSize: 14,
  },

  simpanButton: {
    flex: 1,

    backgroundColor: "#2563eb",

    borderRadius: 12,

    padding: 14,

    alignItems: "center",
  },

  simpanText: {
    color: "#ffffff",

    fontWeight: "bold",

    fontSize: 14,
  },
});
