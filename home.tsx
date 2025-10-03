import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { router, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Timestamp, collection, onSnapshot, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import * as Animatable from "react-native-animatable";

import { db, auth } from "./firebase";
const { width, height } = Dimensions.get("window");


const COLORS = {
  primary: "#4C8BF5",
  background: "#F9F9F9",
  text: "#333",
  card: "#fff",
  gray: "#777",
};

const CARD_WIDTH = (Dimensions.get("window").width - 48) / 2;

const CARD_ITEMS = [
  { title: "Purchase Plan", subtitle: "Manage your bills", icon: "card", route: "/purchase" },
  { title: "Appointments", subtitle: "View & schedule", icon: "calendar", route: "/appointment" },
  { title: "Upcoming", subtitle: "See  other days appointment", icon: "time", route: "/upcoming" },
  { title: "Settings", subtitle: "Customize app", icon: "settings", route: "/account" },
];

const BUSINESS_TYPES = ["Salon", "Beauty Parlor", "Pool", "Gym", "Other"];
const BOTTOM_TABS = [
  { label: "Home", icon: "home-outline", route: "/home" },
  { label: "Appointments", icon: "calendar-outline", route: "/appointment" },
  { label: "Upcoming", icon: "time-outline", route: "/upcoming" },
  { label: "Account", icon: "person-outline", route: "/myprofile" },
];

export default function HomeScreen() {
  const pathname = usePathname();

  const [greetingName, setGreetingName] = useState("Guest");
  const [showIntro, setShowIntro] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [customBusiness, setCustomBusiness] = useState("");
  const [shopName, setShopName] = useState("");
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.displayName) {
      setGreetingName(user.displayName);
    }
  }, []);

  const deleteExpiredAppointments = async () => {
    const now = new Date();
    const snapshot = await getDocs(collection(db, "appointments"));
    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      const apptDate = data.appointmentDateTime.toDate();
      if (apptDate < now) {
        await deleteDoc(doc(db, "appointments", docSnap.id));
        console.log(`Deleted expired appointment: ${docSnap.id}`);
      }
    });
  };

  useEffect(() => {
    const checkBusinessInfo = async () => {
      const savedShopName = await AsyncStorage.getItem("shopName");
      const savedBusinessType = await AsyncStorage.getItem("businessType");
      const savedCustomBusiness = await AsyncStorage.getItem("customBusiness");

      if (savedShopName && (savedBusinessType || savedCustomBusiness)) {
        setShopName(savedShopName);
        setSelectedBusiness(savedBusinessType || "");
        setCustomBusiness(savedCustomBusiness || "");
        setShowIntro(false);
      } else {
        setShowIntro(true);
      }
    };

    checkBusinessInfo();
  }, []);

  useEffect(() => {
    deleteExpiredAppointments();

    const q = query(collection(db, "appointments"), orderBy("appointmentDateTime", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const upcoming = snapshot.docs
        .map((doc) => {
          const data = doc.data() as {
            appointmentDateTime: Timestamp;
            clientName: string;
            phone: string;
          };
          return {
            id: doc.id,
            clientName: data.clientName,
            phone: data.phone,
            appointmentDateTime: data.appointmentDateTime,
          };
        })
        .filter((appt) => appt.appointmentDateTime.toDate() > now);

      setUpcomingAppointments(upcoming);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmitBusiness = async () => {
    if (shopName && (selectedBusiness !== "Other" || customBusiness)) {
      await AsyncStorage.setItem("shopName", shopName);
      await AsyncStorage.setItem("businessType", selectedBusiness);
      if (customBusiness) {
        await AsyncStorage.setItem("customBusiness", customBusiness);
      }
      setShowIntro(false);
    }
  };

  const handleTabPress = (route: string) => {
    if (pathname !== route) {
      router.push(route as never);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal visible={showIntro} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tell us about your business</Text>
            <Text style={styles.modalSubtitle}>Select your business type:</Text>
            <View style={styles.businessOptions}>
              {BUSINESS_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.businessOption,
                    selectedBusiness === type && styles.businessOptionSelected,
                  ]}
                  onPress={() => setSelectedBusiness(type)}
                >
                  <Text style={{ color: selectedBusiness === type ? "#fff" : COLORS.text }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedBusiness === "Other" && (
              <TextInput
                style={styles.input}
                value={customBusiness}
                onChangeText={setCustomBusiness}
                placeholder="Enter your business type"
              />
            )}
            {selectedBusiness ? (
              <>
                <Text style={styles.modalSubtitle}>Enter your shop name:</Text>
                <TextInput
                  style={styles.input}
                  value={shopName}
                  onChangeText={setShopName}
                  placeholder="Shop name"
                />
              </>
            ) : null}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !(shopName && (selectedBusiness !== "Other" || customBusiness)) && {
                  backgroundColor: COLORS.gray,
                },
              ]}
              disabled={!(shopName && (selectedBusiness !== "Other" || customBusiness))}
              onPress={handleSubmitBusiness}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <LinearGradient colors={["#4C8BF5", "#6FA7FF"]} style={styles.header}>
          <Animatable.Text
            animation="fadeInDown"
            delay={200}
            style={styles.greeting}
          >
            Hello, {greetingName} 👋
          </Animatable.Text>
          <TouchableOpacity onPress={() => router.push("/notifcation")}>
            <Ionicons name="notifications-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {CARD_ITEMS.map((item, index) => (
            <Animatable.View
              animation="zoomIn"
              delay={100 * index}
              key={item.title}
              style={styles.card}
            >
              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => router.push(item.route as never)}
              >
                <Ionicons name={item.icon as any} size={32} color={COLORS.primary} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Near Appointments</Text>
        <View style={styles.appointmentsCard}>
          {upcomingAppointments.length === 0 ? (
            <Text style={{ color: COLORS.gray, textAlign: "center" }}>No upcoming appointments.</Text>
          ) : (
            <>
              <FlatList
                data={upcomingAppointments.slice(0, 3)}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <Animatable.View
                    animation="fadeInUp"
                    delay={100 * index}
                    style={styles.clientRow}
                  >
                    <Text style={styles.clientName}>👤 {item.clientName}</Text>
                    <Text style={styles.clientDetail}>📞 {item.phone}</Text>
                    <Text style={styles.clientDetail}>
                      🗓️ {item.appointmentDateTime.toDate().toLocaleString()}
                    </Text>
                  </Animatable.View>
                )}
              />
              <TouchableOpacity onPress={() => router.push("/appointment")}>
                <Text style={{ color: COLORS.primary, textAlign: "center", marginTop: 8 }}>
                  Show more...
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.bottomTabs}>
        {BOTTOM_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab.route)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={tab.route === "/home" ? COLORS.primary : COLORS.gray}
            />
            <Text
              style={{
                color: tab.route === "/home" ? COLORS.primary : COLORS.gray,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.04, // 4% of screen width
    paddingTop: height * 0.02, // 2% of screen height
    paddingBottom: height * 0.1, // 10% of screen height
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: width * 0.03, // 3% of screen width
    borderRadius: width * 0.02, // responsive radius
    marginBottom: height * 0.02, // 2% of screen height
  },
  greeting: { fontSize: width * 0.06, fontWeight: "700", color: "#fff" },
  sectionTitle: { fontSize: width * 0.05, fontWeight: "600", color: COLORS.primary, marginVertical: height * 0.02 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: width * 0.45, // responsive card width (45% of screen width)
    backgroundColor: COLORS.card,
    borderRadius: width * 0.03, // responsive radius
    padding: width * 0.04, // responsive padding
    marginBottom: height * 0.02, // 2% of screen height
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  cardTitle: { marginTop: height * 0.01, fontWeight: "600", fontSize: width * 0.04, color: COLORS.text },
  cardSubtitle: { fontSize: width * 0.03, color: COLORS.gray, textAlign: "center", marginTop: height * 0.01 },
  appointmentsCard: {
    backgroundColor: COLORS.card,
    padding: width * 0.04, // responsive padding
    borderRadius: width * 0.03, // responsive border radius
    marginTop: height * 0.02, // 2% of screen height
    maxHeight: height * 0.25, // max height 25% of screen height
  },
  clientRow: { marginBottom: height * 0.02, borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingBottom: height * 0.01 },
  clientName: { fontSize: width * 0.04, fontWeight: "600", color: COLORS.text },
  clientDetail: { fontSize: width * 0.035, color: COLORS.gray },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingVertical: height * 0.02, // 2% of screen height
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
  },
  tabItem: { alignItems: "center" },
  businessOptions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: height * 0.03 },
  businessOption: {
    padding: width * 0.04, // responsive padding
    margin: width * 0.03, // responsive margin
    borderRadius: width * 0.03, // responsive border radius
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  businessOptionSelected: { backgroundColor: COLORS.primary },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: width * 0.05, // responsive padding
  },
  modalContent: { backgroundColor: "#fff", padding: width * 0.05, borderRadius: width * 0.04, width: "100%" },
  modalTitle: { fontSize: width * 0.06, fontWeight: "700", marginBottom: height * 0.02, textAlign: "center" },
  modalSubtitle: { fontSize: width * 0.05, fontWeight: "500", color: COLORS.text, marginBottom: height * 0.01 },
  input: { borderWidth: 1, borderColor: COLORS.gray, borderRadius: width * 0.04, padding: width * 0.04, marginTop: height * 0.02 },
  submitButton: { marginTop: height * 0.03, backgroundColor: COLORS.primary, paddingVertical: height * 0.03, alignItems: "center", borderRadius: width * 0.04 },
});