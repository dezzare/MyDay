import React from "react";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useState, useEffect } from "react";
import { Text, View, Button, ActivityIndicator, FlatList } from "./Themed";

import Colors from "@/constants/Colors";

interface Agendamento {
  agendamento_id: number;
  data: string;
  horario: string;
  paciente_id: string;
  nomePaciente: string;
}

export default function FeegowApiClient() {
  const [data, setData] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);
  const date = new Date();
  const dateFormat = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const tk = AsyncStorage.getItem("ApiKey")
    .then((r) => {
      if (r == null) {
        return "";
      }
      setToken(r);
      return r;
    })
    .toString(); // Para retornar "string" ao invés de "Promise<string>"

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const baseUrl = new URL("https://api.feegow.com/v1/api/appoints/search/");
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-Access-Token", token);
    const params = new URLSearchParams({
      data_start: dateFormat,
      data_end: dateFormat,
    }).toString();

    try {
      const response = await fetch(`${baseUrl}?${params}`, {
        method: "GET",
        headers: headers,
      });
      console.log(response);
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        const aux: Agendamento[] = await Promise.all(
          result.content.map(async (item: Agendamento) => {
            const name = await fetchPatientName(item.paciente_id);
            console.log(name);
            console.log(item);
            return { ...item, nomePaciente: name };
          }),
        );
        setData(aux);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientName = async (id: string) => {
    setError(null);
    const baseUrl = new URL(
      `https://api.feegow.com/v1/api/patient/search?photo=false&paciente_id=${id}`,
    );
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-Access-Token", token);
    console.log(headers);
    try {
      const response = await fetch(baseUrl, {
        method: "GET",
        headers: headers,
      });
      if (!response.ok) {
        console.log(response);
        throw new Error(`Erro na requisição nome: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log("Sucess:");
        console.log(result);
        return result.content.nome;
      } else {
        return "Desconhecido";
      }
    } catch (err: any) {
      setError(err.message);
      console.log(err);
      return "Erro";
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <View>
        <Text style={styles.error}>Erro: {error}</Text>
        <Button title="Atualizar" onPress={fetchData} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Carregando...</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Agenda vazia para: {dateFormat}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Atualizar" onPress={fetchData} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.agendamento_id}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>
              <Text>Horário: {item.horario}</Text>
              <Text>Paciente: {item.nomePaciente}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    marginTop: 16,
  },

  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});
