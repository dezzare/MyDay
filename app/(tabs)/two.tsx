import { StyleSheet } from "react-native";

import { Text, View, ScrollView } from "@/components/Themed";
import WeekSchedule from "@/components/WeekSchedule";

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <WeekSchedule />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
