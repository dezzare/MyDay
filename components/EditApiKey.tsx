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
      <SafeAreaView>
        <View style={styles.getStartedContainer}>
          <Text style={styles.getWarningText}> *Requerido</Text>
          <TextInput
            style={styles.getTextInput}
            onChangeText={setState}
            value={apiKey}
          />
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView>
        <View style={styles.getStartedContainer}>
          <Text style={styles.getWarningText}> Valor ApiKey: {apiKey}</Text>
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
    alignItems: "center",
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getWarningText: {
    fontSize: 17,
    lineHeight: 24,
    textDecorationColor: "red",
    color: "red",
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
  },
  getTextInput: {
    marginTop: 100,
    height: 40,
    margin: 12,
    borderWidth: 1,
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: "center",
  },
});
