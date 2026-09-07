import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";

import EditPegawaiModal from "../components/admin/EditPegawaiModal";
import TambahPegawaiModal from "../components/admin/TambahPegawaiModal";

export default function ManajemenPegawaiScreen({ callApi, onKembali }) {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  // Pencarian
  const [search, setSearch] = useState("");

  // Modal tambah
  const [showTambah, setShowTambah] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal edit
  const [showEdit, setShowEdit] = useState(false);
  const [pegawaiEdit, setPegawaiEdit] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // ============================================================
  // AMBIL DATA PEGAWAI
  // ============================================================
  const fetchPegawai = async () => {
    setLoading(true);

    try {
      const result = await callApi("getPegawai", {});

      if (Array.isArray(result)) {
        setPegawaiList(result);
      } else {
        Alert.alert("Error", "Gagal memuat data pegawai.");
      }
    } catch (error) {
      console.error("fetchPegawai:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memuat data pegawai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  // ============================================================
  // FILTER PENCARIAN
  // ============================================================
  const pegawaiFiltered = pegawaiList.filter((pegawai) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      String(pegawai.nama || "")
        .toLowerCase()
        .includes(keyword) ||
      String(pegawai.username || "")
        .toLowerCase()
        .includes(keyword) ||
      String(pegawai.nip || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // ============================================================
  // TOGGLE STATUS / BYPASS
  // ============================================================
  const handleToggle = async (username, field, nilaiSekarang) => {
    const nilaiBaru = !nilaiSekarang;

    const labelField = {
      status_aktif: "Status Aktif",
      bypass_radius: "Bypass Radius",
      bypass_sesi: "Bypass Sesi",
    };

    Alert.alert(
      "Konfirmasi",
      `Ubah ${labelField[field]} untuk ${username} menjadi ${
        nilaiBaru ? "Aktif" : "Nonaktif"
      }?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Ya",
          onPress: async () => {
            setUpdating(username + field);

            try {
              const result = await callApi("updateStatusPegawai", {
                username,
                field,
                value: nilaiBaru,
              });

              if (result?.status === "berhasil") {
                setPegawaiList((prev) =>
                  prev.map((p) =>
                    p.username === username
                      ? {
                          ...p,
                          [field]: nilaiBaru,
                        }
                      : p,
                  ),
                );
              } else {
                Alert.alert(
                  "Gagal",
                  result?.message || "Gagal mengubah status pegawai.",
                );
              }
            } catch (error) {
              console.error("handleToggle:", error);
              Alert.alert(
                "Error",
                "Terjadi kesalahan saat mengubah status pegawai.",
              );
            } finally {
              setUpdating(null);
            }
          },
        },
      ],
    );
  };

  // ============================================================
  // TAMBAH PEGAWAI
  // ============================================================
  const handleTambahPegawai = async ({ nama, username, nip }) => {
    setSaving(true);

    try {
      const result = await callApi("tambahPegawai", {
        nama,
        username,
        nip,
      });

      if (result?.status === "berhasil") {
        setShowTambah(false);

        Alert.alert(
          "Sukses",
          `Pegawai ${username} berhasil ditambahkan!\nPassword default: user1234`,
        );

        await fetchPegawai();
      } else {
        Alert.alert("Gagal", result?.message || "Gagal menambahkan pegawai.");
      }
    } catch (error) {
      console.error("handleTambahPegawai:", error);
      Alert.alert("Error", "Terjadi kesalahan saat menambahkan pegawai.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // BUKA MODAL EDIT
  // ============================================================
  const handleBukaEdit = (pegawai) => {
    setPegawaiEdit(pegawai);
    setShowEdit(true);
  };

  // ============================================================
  // BATAL EDIT
  // ============================================================
  const handleBatalEdit = () => {
    if (savingEdit) return;

    setShowEdit(false);
    setPegawaiEdit(null);
  };

  // ============================================================
  // SIMPAN EDIT PEGAWAI
  // ============================================================
  const handleEditPegawai = async ({ username, nama, nip }) => {
    setSavingEdit(true);

    try {
      const result = await callApi("updatePegawai", {
        username,
        nama,
        nip,
      });

      if (result?.status === "berhasil") {
        setPegawaiList((prev) =>
          prev.map((p) =>
            p.username === username
              ? {
                  ...p,
                  nama,
                  nip,
                }
              : p,
          ),
        );

        setShowEdit(false);
        setPegawaiEdit(null);

        Alert.alert("Sukses", `Data pegawai ${username} berhasil diperbarui.`);
      } else {
        Alert.alert(
          "Gagal",
          result?.message || "Gagal memperbarui data pegawai.",
        );
      }
    } catch (error) {
      console.error("handleEditPegawai:", error);

      Alert.alert("Error", "Terjadi kesalahan saat memperbarui data pegawai.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ============================================================
  // RESET PASSWORD
  // ============================================================
  const handleResetPassword = (username) => {
    Alert.alert("Reset Password", `Reset password ${username} ke "user1234"?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          setUpdating(username + "reset");

          try {
            const result = await callApi("resetPassword", { username });

            if (result?.status === "berhasil") {
              Alert.alert(
                "Sukses",
                `Password ${username} berhasil direset ke "user1234"!`,
              );
            } else {
              Alert.alert(
                "Gagal",
                result?.message || "Gagal mereset password.",
              );
            }
          } catch (error) {
            console.error("handleResetPassword:", error);

            Alert.alert("Error", "Terjadi kesalahan saat mereset password.");
          } finally {
            setUpdating(null);
          }
        },
      },
    ]);
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onKembali}>
          <Text style={styles.kembaliText}>← Kembali</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Manajemen Pegawai</Text>

        <TouchableOpacity onPress={() => setShowTambah(true)}>
          <Text style={styles.tambahText}>+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* DAFTAR PEGAWAI */}
      <ScrollView
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPegawai} />
        }
      >
        {/* PENCARIAN */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama, username, atau NIP..."
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>

        {loading && pegawaiList.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#2563eb"
            style={{ marginTop: 40 }}
          />
        ) : pegawaiList.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada data pegawai.</Text>
        ) : pegawaiFiltered.length === 0 ? (
          <View style={styles.noResultContainer}>
            <Text style={styles.noResultIcon}>🔎</Text>
            <Text style={styles.noResultTitle}>Pegawai tidak ditemukan</Text>
            <Text style={styles.noResultText}>
              Tidak ada pegawai yang cocok dengan "{search}".
            </Text>
          </View>
        ) : (
          pegawaiFiltered.map((pegawai, index) => (
            <View key={pegawai.username || index} style={styles.card}>
              {/* HEADER CARD */}
              <View style={styles.cardHeader}>
                <View style={styles.identityContainer}>
                  <Text style={styles.namaText}>{pegawai.nama || "-"}</Text>

                  <Text style={styles.usernameText}>@{pegawai.username}</Text>

                  {pegawai.nip ? (
                    <Text style={styles.nipText}>NIP: {pegawai.nip}</Text>
                  ) : (
                    <Text style={styles.nipEmptyText}>NIP belum diisi</Text>
                  )}
                </View>

                <View
                  style={[
                    styles.badgeStatus,
                    {
                      backgroundColor: pegawai.status_aktif
                        ? "#dcfce7"
                        : "#fee2e2",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: pegawai.status_aktif ? "#16a34a" : "#dc2626",
                      },
                    ]}
                  >
                    {pegawai.status_aktif ? "Aktif" : "Nonaktif"}
                  </Text>
                </View>
              </View>

              {/* TOGGLE STATUS AKTIF */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Status Aktif</Text>

                  <Text style={styles.toggleDesc}>
                    Izinkan pegawai untuk login
                  </Text>
                </View>

                {updating === pegawai.username + "status_aktif" ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Switch
                    value={pegawai.status_aktif === true}
                    onValueChange={() =>
                      handleToggle(
                        pegawai.username,
                        "status_aktif",
                        pegawai.status_aktif,
                      )
                    }
                    trackColor={{
                      false: "#d1d5db",
                      true: "#93c5fd",
                    }}
                    thumbColor={pegawai.status_aktif ? "#2563eb" : "#9ca3af"}
                  />
                )}
              </View>

              {/* TOGGLE BYPASS RADIUS */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Bypass Radius</Text>

                  <Text style={styles.toggleDesc}>Absen dari mana saja</Text>
                </View>

                {updating === pegawai.username + "bypass_radius" ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Switch
                    value={pegawai.bypass_radius === true}
                    onValueChange={() =>
                      handleToggle(
                        pegawai.username,
                        "bypass_radius",
                        pegawai.bypass_radius,
                      )
                    }
                    trackColor={{
                      false: "#d1d5db",
                      true: "#fcd34d",
                    }}
                    thumbColor={pegawai.bypass_radius ? "#f59e0b" : "#9ca3af"}
                  />
                )}
              </View>

              {/* TOGGLE BYPASS SESI */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Bypass Sesi</Text>

                  <Text style={styles.toggleDesc}>Absen di luar jam sesi</Text>
                </View>

                {updating === pegawai.username + "bypass_sesi" ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Switch
                    value={pegawai.bypass_sesi === true}
                    onValueChange={() =>
                      handleToggle(
                        pegawai.username,
                        "bypass_sesi",
                        pegawai.bypass_sesi,
                      )
                    }
                    trackColor={{
                      false: "#d1d5db",
                      true: "#fcd34d",
                    }}
                    thumbColor={pegawai.bypass_sesi ? "#f59e0b" : "#9ca3af"}
                  />
                )}
              </View>

              {/* AKSI PEGAWAI */}
              <View style={styles.actionRow}>
                {/* EDIT DATA */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleBukaEdit(pegawai)}
                >
                  <Text style={styles.editButtonText}>✏️ Edit Data</Text>
                </TouchableOpacity>

                {/* RESET PASSWORD */}
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => handleResetPassword(pegawai.username)}
                  disabled={updating === pegawai.username + "reset"}
                >
                  {updating === pegawai.username + "reset" ? (
                    <ActivityIndicator size="small" color="#dc2626" />
                  ) : (
                    <Text style={styles.resetButtonText}>
                      🔑 Reset Password
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL TAMBAH PEGAWAI */}
      <TambahPegawaiModal
        visible={showTambah}
        onSimpan={handleTambahPegawai}
        onBatal={() => setShowTambah(false)}
      />

      {/* MODAL EDIT PEGAWAI */}
      <EditPegawaiModal
        visible={showEdit}
        pegawai={pegawaiEdit}
        onSimpan={handleEditPegawai}
        onBatal={handleBatalEdit}
        saving={savingEdit}
      />

      {/* LOADING OVERLAY SAAT TAMBAH */}
      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />

          <Text style={styles.loadingText}>Menyimpan...</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    elevation: 3,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },

  kembaliText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },

  tambahText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },

  // SCROLL
  scroll: {
    flex: 1,
    padding: 16,
  },

  // SEARCH
  searchContainer: {
    marginBottom: 12,
  },

  searchInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#1f2937",
  },

  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    fontSize: 14,
  },

  // SEARCH NO RESULT
  noResultContainer: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },

  noResultIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  noResultTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
  },

  noResultText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 5,
  },

  // CARD
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },

  identityContainer: {
    flex: 1,
    marginRight: 12,
  },

  namaText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
  },

  usernameText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },

  nipText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 3,
  },

  nipEmptyText: {
    fontSize: 11,
    color: "#d1d5db",
    marginTop: 3,
    fontStyle: "italic",
  },

  // STATUS
  badgeStatus: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  // TOGGLE
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },

  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },

  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  toggleDesc: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },

  // ACTION BUTTON
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  editButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },

  resetButton: {
    flex: 1,
    backgroundColor: "#fff1f2",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  resetButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 13,
  },

  // LOADING
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#ffffff",
    marginTop: 12,
    fontSize: 14,
  },
});
