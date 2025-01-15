import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View, Button, ActivityIndicator, ScrollView } from "./Themed";

interface Agendamento {
  agendamento_id: number;
  data: string;
  horario: string;
  paciente_id: string;
  nomePaciente: string;
}

export default function WeeklyAgenda() {
  const [data, setData] = useState<Record<string, Agendamento[]>>({});
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const tk = AsyncStorage.getItem("ApiKey").then((r) => {
    if (r == null) {
      return "";
    }
    setToken(r);
    return r;
  });

  const fetchWeeklyAgendamentos = async () => {
    const { startOfWeek, endOfWeek } = getWeekRange();
    const baseUrl = new URL("https://api.feegow.com/v1/api/appoints/search/");
    const params = new URLSearchParams({
      data_start: startOfWeek,
      data_end: endOfWeek,
    });
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("X-Access-Token", token);

    try {
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: headers,
      });

      const json = await response.json();

      if (json.success) {
        const aux = await Promise.all(
          json.content.map(async (item: Agendamento) => {
            const name = await fetchPatientName(item.paciente_id);
            return { ...item, nomePaciente: name };
          }),
        );
        const groupedData = groupByDay(aux);
        setData(groupedData); // Atualiza o estado com os agendamentos agrupados por dia
      } else {
        console.error("Erro na resposta: ", json);
      }
    } catch (error) {
      console.error("Erro na requisição: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientName = async (id: string) => {
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
      console.log(err);
      return "Erro";
    }
  };

  useEffect(() => {
    fetchWeeklyAgendamentos();
  }, []);

  const getWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    //Ajusta a data para segunda da semana atual
    const startOfWeek = new Date(today);
    if (dayOfWeek === 0) {
      // Se for domingo, avança para a próxima segunda-feira
      startOfWeek.setDate(today.getDate() + 1);
    } else {
      // Caso contrário, volta para a última segunda-feira
      startOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
    }

    // Ajusta a data para sábado
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 5);

    const format = (date: Date) =>
      `${String(date.getDate())}-${String(date.getMonth() + 1)}-${date.getFullYear()}`;

    return {
      startOfWeek: format(startOfWeek),
      endOfWeek: format(endOfWeek),
    };
  };

  const groupByDay = (
    agendamentos: Agendamento[],
  ): Record<string, Agendamento[]> => {
    const grouped: Record<string, Agendamento[]> = {};

    const diasDaSemana = [
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    // Inicializa cada dia da semana com um array vazio
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + i);
      const key = diasDaSemana[date.getDay()];
      grouped[key] = [];
    }

    // Agrupa os agendamentos por data
    agendamentos.forEach((agendamento) => {
      const date = new Date(agendamento.data.split("-").reverse().join("-")); // Converte a data do formato DD-MM-YYYY para Date
      const dayName = diasDaSemana[date.getDay()]; // Ajuste para começar a semana na segunda-feira
      if (grouped[dayName]) {
        grouped[dayName].push(agendamento);
      }
    });

    return grouped;
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const toggleExpand = (day: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !(prev[day] ?? false),
    }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Atualizar" onPress={fetchWeeklyAgendamentos} />
      <ScrollView>
        {Object.keys(data).map((day) => (
          <View key={day}>
            <TouchableOpacity onPress={() => toggleExpand(day)}>
              <Text style={styles.dayTitle}>{day}</Text>
            </TouchableOpacity>
            {expandedDays[day] && (
              <View style={styles.agendamentos}>
                {data[day].length === 0 ? (
                  <Text style={styles.emptyMessage}>Dia livre</Text>
                ) : (
                  data[day].map((agendamento) => (
                    <View key={agendamento.agendamento_id} style={styles.card}>
                      <Text>Horário: {agendamento.horario}</Text>
                      <Text>Paciente: {agendamento.nomePaciente}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  agendamentos: {
    paddingLeft: 16,
  },
  card: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyMessage: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
});
