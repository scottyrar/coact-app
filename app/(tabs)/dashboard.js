import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import { useColorScheme } from "nativewind";
import { database } from "../../firebase";
import { AuthStore } from "../../store/authStore";
import { ref, get } from "firebase/database";
import { SelectList } from "react-native-dropdown-select-list";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

function Dashboard() {
  // lang
  const { t } = useTranslation();

  // theme
  const { colorScheme } = useColorScheme();

  // base
  const user = AuthStore.useState((s) => s.user);
  const dbRef = ref(database, `users/${user?.uid}/history`);

  // constant
  const [history, setHistory] = useState([]);
  const [deviceName, setDeviceName] = useState("");
  const [deviceNameList, setDeviceList] = useState([]);

  // table
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth * 0.9;
  const q1 = [t("dashboard.jan"), t("dashboard.feb"), t("dashboard.mar")];
  const q2 = [t("dashboard.apr"), t("dashboard.may"), t("dashboard.jun")];
  const q3 = [t("dashboard.jul"), t("dashboard.aug"), t("dashboard.sep")];
  const q4 = [t("dashboard.oct"), t("dashboard.nov"), t("dashboard.dec")];
  const leg = [t("dashboard.on"), t("dashboard.off"), t("dashboard.plan")];
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [data3, setData3] = useState([]);
  const [data4, setData4] = useState([]);
  const chartConfig = {
    backgroundColor: `${colorScheme === "dark" ? "#1f2937" : "white"}`, // Set the background color to transparent
    backgroundGradientFrom: `${colorScheme === "dark" ? "#1f2937" : "white"}`,
    backgroundGradientTo: `${colorScheme === "dark" ? "#1f2937" : "white"}`,
    color: () => `${colorScheme === "dark" ? "white" : "black"}`,
  };

  // fucntion
  async function getHistory() {
    try {
      const snapshot = await get(dbRef);
      const data = [];
      snapshot.forEach((childSnapshot) => {
        data.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setHistory(data);
    } catch (error) {
      console.log(error);
    }
  }

  function getQuarterData(startMonth, setData) {
    const months = [startMonth, startMonth + 1, startMonth + 2];

    const res = months.map((month) => {
      const onLength = history.filter((item) => {
        const dateParts = item.date.split("-");
        const itemMonth = parseInt(dateParts[1]);
        return (
          itemMonth === month &&
          item.device === deviceName &&
          item.status === "On"
        );
      });
      const offLength = history.filter((item) => {
        const dateParts = item.date.split("-");
        const itemMonth = parseInt(dateParts[1]);
        return (
          itemMonth === month &&
          item.device === deviceName &&
          item.status === "Off"
        );
      });
      const planLength = history.filter((item) => {
        const dateParts = item.date.split("-");
        const itemMonth = parseInt(dateParts[1]);
        return itemMonth === month && item.device === deviceName && item.onplan;
      });

      return onLength.length === 0 &&
        offLength.length === 0 &&
        planLength.length === 0
        ? []
        : [
            onLength.length === 0 ? 0 : onLength.length,
            offLength.length === 0 ? 0 : offLength.length,
            planLength.length === 0 ? 0 : planLength.length,
          ];
    });

    setData(res);
  }

  async function getAllDevice() {
    try {
      const snapshot = await get(ref(database, `users/${user?.uid}/device`));
      const data = [];
      snapshot.forEach((childSnapshot) => {
        data.push({
          key: childSnapshot.val().name,
          value: childSnapshot.key,
        });
      });
      setDeviceList(data);
    } catch (error) {
      console.error();
    }
  }

  useEffect(() => {
    getAllDevice();
    getHistory();
  }, []);

  useEffect(() => {
    if (deviceName !== "") {
      getQuarterData(1, setData1); // Q1: January, February, March
      getQuarterData(4, setData2); // Q2: April, May, June
      getQuarterData(7, setData3); // Q3: July, August, September
      getQuarterData(10, setData4); // Q4: October, November, December
    }
  }, [deviceName]);

  return (
    <View className="dark:bg-gray-900 flex-1 py-3 space-y-3">
      <View className="px-3">
        <SelectList
          setSelected={(val) => setDeviceName(val)}
          data={deviceNameList}
          save="value"
          fontFamily="Kanit"
          placeholder={t("dashboard.select")}
          boxStyles={{
            backgroundColor: colorScheme === "dark" ? "#1f2937" : "white",
            borderWidth: 0,
          }}
          inputStyles={{ color: colorScheme === "dark" ? "white" : "black" }}
          dropdownStyles={{
            backgroundColor: colorScheme === "dark" ? "#1f2937" : "white",
            borderWidth: 0,
          }}
          dropdownTextStyles={{
            color: colorScheme === "dark" ? "white" : "black",
          }}
          searchPlaceholder=""
          arrowicon={
            <FontAwesome
              name="chevron-down"
              size={16}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          }
          searchicon={
            <View className="pr-3">
              <FontAwesome
                name="search"
                size={16}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </View>
          }
          closeicon={
            <FontAwesome
              name="close"
              size={16}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          }
        />
      </View>
      <ScrollView className="px-3 space-y-3">
        <View className="flex-col items-center space-y-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
          <Text
            style={{ fontFamily: "Kanit" }}
            className="text-2xl dark:text-white"
          >
            {t("dashboard.que")}1
          </Text>
          <StackedBarChart
            data={{
              labels: q1,
              legend: leg,
              data: data1,
              barColors: ["#0FB87B", "#F49287", "#60a5fa"],
            }}
            width={chartWidth}
            height={300}
            chartConfig={chartConfig}
          />
        </View>
        <View className="flex-col items-center space-y-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
          <Text
            style={{ fontFamily: "Kanit" }}
            className="text-2xl dark:text-white"
          >
            {t("dashboard.que")}2
          </Text>
          <StackedBarChart
            data={{
              labels: q2,
              legend: leg,
              data: data2,
              barColors: ["#0FB87B", "#F49287", "#60a5fa"],
            }}
            width={chartWidth}
            height={300}
            chartConfig={chartConfig}
          />
        </View>
        <View className="flex-col items-center space-y-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
          <Text
            style={{ fontFamily: "Kanit" }}
            className="text-2xl dark:text-white"
          >
            {t("dashboard.que")}3
          </Text>
          <StackedBarChart
            data={{
              labels: q3,
              legend: leg,
              data: data3,
              barColors: ["#0FB87B", "#F49287", "#60a5fa"],
            }}
            width={chartWidth}
            height={300}
            chartConfig={chartConfig}
          />
        </View>
        <View className="flex-col items-center space-y-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow">
          <Text
            style={{ fontFamily: "Kanit" }}
            className="text-2xl dark:text-white"
          >
            {t("dashboard.que")}4
          </Text>
          <StackedBarChart
            data={{
              labels: q4,
              legend: leg,
              data: data4,
              barColors: ["#0FB87B", "#F49287", "#60a5fa"],
            }}
            width={chartWidth}
            height={300}
            chartConfig={chartConfig}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default Dashboard;
