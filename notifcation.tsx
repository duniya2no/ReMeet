import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  collection,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
const COLORS = {
  primary: "#4C8BF5",
  secondary: "#6FA7FF",
  background: "#F9F9F9",
  text: "#333",
  card: "#fff",
  gray: "#777",
  created: "#E3F9E5",
  deleted: "#FFE5E5",
  finished: "#E5F0FF",
  timerOver: "#FFF5E5",
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = getDocs(q).then((snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data?.title || "Notification",
          message: data?.message || "",
          type: data?.type || "Other",
          createdAt: data?.createdAt?.toDate?.() || null,
        };
      });
      setNotifications(items);
    });
    return () => {};
  }, []);

  const getCardColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "created":
        return COLORS.created;
      case "deleted":
        return COLORS.deleted;
      case "finished":
        return COLORS.finished;
      case "timerover":
        return COLORS.timerOver;
      default:
        return COLORS.card;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert("Clear All", "Are you sure you want to delete all notifications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: async () => {
          try {
            const q = query(collection(db, "notifications"));
            const querySnapshot = await getDocs(q);
            querySnapshot.docs.forEach(async (docItem: QueryDocumentSnapshot) => {
              await deleteDoc(doc(db, "notifications", docItem.id));
            });
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity
      onPress={() => deleteNotification(id)}
      style={styles.deleteButton}
    >
      <Ionicons name="trash-bin" size={24} color="#fff" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Animated.View entering={FadeInUp.duration(300)}>
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <View style={[styles.card, { backgroundColor: getCardColor(item.type) }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {item.createdAt ? item.createdAt.toLocaleString() : "Time not available"}
          </Text>
        </View>
      </Swipeable>
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={clearAllNotifications}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.content}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  
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
    color: "#fff",
    fontWeight: "600",
  },
  
  content: { flex: 1, padding: width * 0.04 }, // 4% of screen width
  
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  emptyText: {
    marginTop: height * 0.02, // 2% of screen height
    fontSize: width * 0.04, // 4% of screen width
    color: COLORS.gray,
  },
  
  card: {
    borderRadius: width * 0.03, // 3% of screen width
    padding: width * 0.04, // 4% of screen width
    marginBottom: height * 0.02, // 2% of screen height
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: width * 0.01, // 1% of screen width
    elevation: 1,
  },
  
  title: {
    fontSize: width * 0.04, // 4% of screen width
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: height * 0.01, // 1% of screen height
  },
  
  message: {
    fontSize: width * 0.035, // 3.5% of screen width
    color: COLORS.gray,
    marginBottom: height * 0.015, // 1.5% of screen height
  },
  
  time: {
    fontSize: width * 0.03, // 3% of screen width
    color: "#999",
  },
  
  deleteButton: {
    backgroundColor: "#e53935",
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.2, // 20% of screen width
    borderRadius: width * 0.03, // 3% of screen width
    marginVertical: height * 0.015, // 1.5% of screen height
  },
});
