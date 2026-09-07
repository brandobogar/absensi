import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

export default function TambahPegawaiModal({
  visible,
  onSimpan,
  onBatal,
}) {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [nip, setNip] = useState("");

  const handleSimpan = () => {
    if (!nama.trim() || !username.trim()) {
      Alert.alert("Error", "Nama dan username wajib diisi!");
      return;
    }

    onSimpan({
      nama: nama.trim(),
      username: username.trim(),
      nip: nip.trim(),
    });

    setNama("");
    setUsername("");
    setNip("");
  };

  const handleBatal = () => {
    setNama("");
    setUsername("");
    setNip("");
    onBatal();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleBatal}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Tambah Pegawai Baru
            </Text>

            {/* NAMA */}
            <Text style={styles.inputLabel}>
              Nama Lengkap
            </Text>

            <TextInput
              style={styles.input}
              value={nama}
              onChangeText={setNama}
              placeholder="contoh: Brando Bogar"
            />

            {/* USERNAME */}
            <Text style={styles.inputLabel}>
              Username
            </Text>

            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="contoh: brandobogar"
              autoCapitalize="none"
            />

            {/* NIP */}
            <Text style={styles.inputLabel}>
              NIP (opsional)
            </Text>

            <TextInput
              style={styles.input}
              value={nip}
              onChangeText={(text) => {
                setNip(text.replace(/[^0-9]/g, ""));
              }}
              placeholder="contoh: 199001012020121001"
              keyboardType="number-pad"
              maxLength={18}
            />

            {/* INFO PASSWORD */}
            <Text style={styles.infoText}>
              🔑 Password default:{" "}
              <Text style={styles.passwordText}>
                user1234
              </Text>
            </Text>

            {/* BUTTON */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.batalButton}
                onPress={handleBatal}
              >
                <Text style={styles.batalText}>
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.simpanButton}
                onPress={handleSimpan}
              >
                <Text style={styles.simpanText}>
                  Simpan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: "#f9fafb",
  },

  infoText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 8,
  },

  passwordText: {
    fontWeight: "bold",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
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

