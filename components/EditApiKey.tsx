import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet } from "react-native";
import { SafeAreaView, View, Text, TextInput } from "./Themed";
import { useState } from "react";

async function handleApiKey(
  method: string,
  value?: string,
): Promise<string | null> {
  let resp: string | null = null;

  switch (method) {
    case "get":
      try {
        const v = await AsyncStorage.getItem("ApiKey");
        resp = v;
      } catch (e) {
        console.warn("Erro ao procurar pela ApiKey: ", e);
      }
      break;
    case "write":
      if (value != "" && value != undefined) {
        try {
          console.log("write: ", value);
          resp = value;
          await AsyncStorage.setItem("ApiKey", value);
        } catch (e) {
          console.warn("Erro ao gravar ApiKey: ", e);
        }
      } else {
        try {
          console.log("Remove: ", value?.toString());
          await AsyncStorage.removeItem("ApiKey");
          resp = null;
        } catch (e) {
          console.warn("Erro ao remover ApiKey: ", e);
        }
      }
      break;
    default:
      console.log("DEFAULT");
      resp = null;
      break;
  }

  return resp;
}

export default function EditApiKey() {
  const [apiKey, setApiKey] = useState("");

  const setState = async (s?: string): Promise<string | null> => {
    if (s != undefined) {
      setApiKey(s);
      const w = await handleApiKey("write", s);
      return w;
    } else {
      setApiKey("");
      return "";
    }
  };

  const getKey = handleApiKey("get").then((r) => {
    if (r != null) {
      setApiKey(r.toString());
      return r.toString();
    }
    return "";
  });

  if (apiKey == "") {
    return (
      <SafeAreaView style={styles.getStartedContainer}>
        <View style={styles.getInputContainer}>
          <Text style={styles.getStartedText}>API Key:</Text>
          <TextInput
            style={styles.getTextInput}
            placeholder="Digite sua API Key"
            onChangeText={setState}
            value={apiKey}
          />
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.getStartedContainer}>
        <View style={styles.getInputContainer}>
          <Text style={styles.getStartedText}>API Key:</Text>
          <TextInput
            style={styles.getTextInput}
            onChangeText={setState}
            value={apiKey}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  getStartedContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  getInputContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  getTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  getStartedText: {
    fontSize: 17,
    lineHeight: 50,
  },
  getTextInput: {
    height: 50,
    margin: 12,
    padding: 10,
    borderWidth: 1,
    width: "80%",
    maxWidth: 300,
    alignSelf: "center",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
