import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  ToastAndroid,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";

import { db } from "./firebase";
const { width, height } = Dimensions.get("window");
const COLORS = {
  primary: "#4C8BF5",
  secondary: "#6FA7FF",
  background: "#F9F9F9",
  text: "#333",
  card: "#fff",
  gray: "#777",
  highlight: "#FFF6E6",
};

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function UpcomingScreen() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(new Date());

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const deleteExpiredAppointments = async () => {
    const now = new Date();
    const snapshot = await getDocs(collection(db, "appointments"));
    snapshot.forEach(async (d) => {
      const data = d.data();
      if (data.appointmentDateTime.toDate() < now) {
        await deleteDoc(doc(db, "appointments", d.id));
        console.log(`Deleted expired appointment: ${d.id}`);
      }
    });
  };

  useEffect(() => {
    deleteExpiredAppointments();

    const q = query(
      collection(db, "appointments"),
      orderBy("appointmentDateTime", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const grouped: Record<string, any[]> = {};

      WEEK_DAYS.forEach((day) => {
        grouped[day] = [];
      });

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const date = data.appointmentDateTime.toDate();

        if (date <= now || data.status === "done" || data.status === "cancelled") return;

        const weekday = WEEK_DAYS[date.getDay()];

        grouped[weekday].push({
          id: docSnap.id,
          clientName: data.clientName,
          phone: data.phone,
          dateTime: date,
        });
      });

      const result = WEEK_DAYS.map((day) => ({
        title: day,
        data: grouped[day],
      })).filter((section) => section.data.length > 0);

      setSections(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openEditModal = (item: any) => {
    setEditData(item);
    setName(item.clientName);
    setPhone(item.phone);
    setDate(item.dateTime);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    try {
      await updateDoc(doc(db, "appointments", editData.id), {
        clientName: name,
        phone,
        appointmentDateTime: Timestamp.fromDate(date),
      });
      showToast("Appointment updated!");
      setEditModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Yes",
        onPress: async () => {
          await deleteDoc(doc(db, "appointments", id));
          showToast("Deleted!");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
         <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
           <TouchableOpacity onPress={() => router.back()}>
             <Ionicons name="arrow-back-outline" size={26} color="#fff" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>My Profile</Text>
           <View style={{ width: 26 }} />
         </LinearGradient>
   

      <View style={styles.container}>
        {sections.length === 0 ? (
          <Text style={styles.noData}>No upcoming appointments found.</Text>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <Animated.Text entering={FadeInUp} style={styles.sectionHeader}>
                {title}
              </Animated.Text>
            )}
            renderItem={({ item }) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isToday = item.dateTime.toDateString() === today.toDateString();

              return (
                <Animated.View
                  entering={FadeInUp.springify().duration(500)}
                  exiting={FadeOut.duration(300)}
                  style={[
                    styles.card,
                    !isToday && { backgroundColor: COLORS.highlight },
                  ]}
                >
                  <View>
                    <Text style={styles.clientName}>👤 {item.clientName}</Text>
                    <Text style={styles.clientDetail}>📞 {item.phone}</Text>
                    <Text style={styles.clientDetail}>
                      🗓️ {item.dateTime.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                      <Text style={{ color: COLORS.primary }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={{ color: "red", marginLeft: 12 }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            }}
          />
        )}
      </View>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Edit Appointment</Text>
              <TextInput
                style={styles.input}
                placeholder="Client Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity onPress={() => setPickerVisible(true)}>
                <Text style={styles.datePickerText}>
                  📅 {date.toLocaleString()}
                </Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={pickerVisible}
                mode="datetime"
                date={date}
                onConfirm={(selectedDate) => {
                  setDate(selectedDate);
                  setPickerVisible(false);
                }}
                onCancel={() => setPickerVisible(false)}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.04, // 4% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
    borderBottomLeftRadius: width * 0.03, // 3% of screen width
    borderBottomRightRadius: width * 0.03, // 3% of screen width
  },

  headerTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: "#fff",
  },

  container: { flex: 1, padding: width * 0.04 }, // 4% of screen width

  noData: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: height * 0.1, // 10% of screen height
    fontSize: width * 0.04, // 4% of screen width
  },

  sectionHeader: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: COLORS.primary,
    marginVertical: height * 0.02, // 2% of screen height
  },

  card: {
    backgroundColor: COLORS.card,
    padding: width * 0.04, // 4% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    marginBottom: height * 0.02, // 2% of screen height
    elevation: 1,
  },

  clientName: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    color: COLORS.text,
  },

  clientDetail: {
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.gray,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: height * 0.02, // 2% of screen height
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: width * 0.04, // 4% of screen width
  },

  modalContent: {
    width: width * 0.8, // 80% of screen width
    backgroundColor: "#fff",
    borderRadius: width * 0.03, // 3% of screen width
    padding: width * 0.04, // 4% of screen width
  },

  modalTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "bold",
    marginBottom: height * 0.02, // 2% of screen height
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: width * 0.03, // 3% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
  },

  datePickerText: {
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.primary,
    marginBottom: height * 0.02, // 2% of screen height
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    padding: width * 0.05, // 5% of screen width
    borderRadius: width * 0.04, // 4% of screen width
    alignItems: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
  },
});
