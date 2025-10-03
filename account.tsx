import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useTheme } from "./themecontext";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";
import Animated, {
  FadeIn,
  FadeInRight,
  ZoomIn,
  BounceIn,
} from "react-native-reanimated";
const { width, height } = Dimensions.get("window");
export default function MyProfileScreen() {
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const COLORS = {
    primary: "#4C8BF5",
    secondary: "#6FA7FF",
    background: darkMode ? "#121212" : "#F9F9F9",
    text: darkMode ? "#fff" : "#333",
    card: darkMode ? "#1E1E1E" : "#fff",
    gray: "#777",
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setNotificationsEnabled(data.notificationsEnabled ?? true);
        setDarkMode(data.darkMode ?? false);
      }
    };

    fetchProfile();
  }, []);

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      notificationsEnabled: val,
    });
  };

  const handleToggleDarkMode = async (val: boolean) => {
    setDarkMode(val);
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      darkMode: val,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account Settings */}
        <Animated.View entering={FadeInRight.duration(600)}>
          <Section title="👤 Account Settings" color={COLORS}>
            <Option label="Edit Profile" onPress={() => router.push("/myprofile")} />
            <Option label="Change Password" onPress={() => router.push("/changepassword")} />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(100).duration(600)}>
          <Section title="🛟 Support" color={COLORS}>
            <Option label="Help Center" onPress={() => router.push("/help")} />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(200).duration(600)}>
          <Section title="ℹ️ About" color={COLORS}>
            <Option label="About Us" onPress={() => router.push("/about")} />
            <Option label="Terms & Privacy" onPress={() => router.push("/terms")} />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(300).duration(600)}>
          <Section title="⚙️ Preferences" color={COLORS}>
            <PreferenceRow
              label="🔔 Notifications"
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              color={COLORS}
            />
          </Section>
        </Animated.View>

        <Animated.View entering={BounceIn.delay(400).duration(600)}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => router.replace("/login")}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, color }: { title: string; children: React.ReactNode; color: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: color.primary }]}>{title}</Text>
      {children}
    </View>
  );
}

function Option({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(500)}>
      <TouchableOpacity style={styles.optionRow} onPress={onPress}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Ionicons name="chevron-forward-outline" size={16} color="#777" />
      </TouchableOpacity>
    </Animated.View>
  );
}

function PreferenceRow({
  label,
  value,
  onValueChange,
  color,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  color: any;
}) {
  return (
    <Animated.View entering={ZoomIn.duration(500)}>
      <View style={[styles.preferenceRow, { backgroundColor: color.card }]}>
        <Text style={[styles.infoLabel, { color: color.text }]}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: color.gray, true: color.primary }}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: width * 0.06, // 6% of screen width
    fontWeight: "600",
    color: "#fff",
  },
  scrollContent: {
    padding: width * 0.05, // 5% of screen width
    paddingBottom: height * 0.05, // 5% of screen height
  },
  section: { marginBottom: height * 0.03 }, // 3% of screen height
  sectionTitle: {
    fontSize: width * 0.05, // 5% of screen width
    fontWeight: "600",
    marginBottom: height * 0.02, // 2% of screen height
  },
  infoLabel: {
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "500",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    borderRadius: width * 0.025, // 2.5% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: width * 0.025, // 2.5% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.025, // 2.5% of screen height
    borderRadius: width * 0.03, // 3% of screen width
    marginTop: height * 0.04, // 4% of screen height
  },
  logoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: width * 0.04, // 4% of screen width
    marginLeft: width * 0.03, // 3% of screen width
  },
});