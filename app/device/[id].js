import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Keyboard,
  Switch,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { AntDesign, Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useMemo, useRef, useState, useEffect } from "react";
import Checkbox from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addHours } from "date-fns";
import { AuthStore } from "../../store/authStore";
import { database } from "../../firebase";
import { ref, onValue, set } from "firebase/database";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function DeviceId() {
  const { id } = useLocalSearchParams();
  const user = AuthStore.useState((s) => s.user);
  const dbRef = ref(database, `users/${user?.uid}/device/${id}`);
  const [dbDevice, setDevice] = useState({});
  const [dbIndex, setIndex] = useState(0);
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();

  const now = new Date();
  const options = { weekday: "short" };
  const currentDay = now.toLocaleDateString("en-US", options).substring(0, 3);

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [planName, setPlanName] = useState("");
  const [timeStart, setTimeStart] = useState(new Date());
  const [timeEnd, setTimeEnd] = useState(addHours(new Date(), 1));
  const [date, setDate] = useState([currentDay]);
  const [editAble, setEditAble] = useState(false);

  const [modalType, setType] = useState(null);
  const snapPoints = useMemo(() => ["80%", "95%"], []);
  const bottomSheetRef = useRef(null);

  const handleOpen = () => bottomSheetRef.current?.expand();
  const handleClose = () => bottomSheetRef.current?.close();

  function getDevice() {
    try {
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        setDevice(data);
        setDeviceName(data.name);
      });
    } catch (error) {
      console.error(error);
    }
  }

  const addDate = (dayToAdd) => {
    const isMonInArray = date.includes(dayToAdd);
    if (isMonInArray) {
      const updatedDate = date.filter((day) => day !== dayToAdd);
      setDate(updatedDate);
    } else {
      setDate([...date, dayToAdd]);
    }
  };

  const toggleAllDays = () => {
    if (date.length === 7) {
      setDate([]);
    } else {
      setDate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    }
  };

  function onStart(event, selectedTime) {
    const currentTime = new Date();
    const isSameDay = selectedTime.getDate() === currentTime.getDate();

    if (isSameDay) {
      setShowStart(false);
      setTimeStart(selectedTime);
    } else {
      Alert.alert(
        "Invalid Start Time",
        "Start time must be on the same day as the current day.",
        [{ text: "OK" }]
      );
      setShowStart(false);
    }
  }

  function onEnd(event, selectedTime) {
    const currentTime = new Date();
    const isSameDay = selectedTime.getDate() === currentTime.getDate();

    if (isSameDay && selectedTime >= timeStart) {
      setShowEnd(false);
      setTimeEnd(selectedTime);
    } else if (!isSameDay) {
      Alert.alert(
        "Invalid End Time",
        "End time must be on the same day as the current day.",
        [{ text: "OK" }]
      );
      setShowEnd(false);
    } else {
      Alert.alert(
        "Invalid End Time",
        "End time must be later than or equal to the start time.",
        [{ text: "OK" }]
      );
      setShowEnd(false);
    }
  }

  function openModal(type, index) {
    setType(type);
    if (type === "Edit") {
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        dbDevice.plans[index]?.hour_start,
        dbDevice.plans[index]?.min_start,
        0,
        0
      );
      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        dbDevice.plans[index]?.hour_end,
        dbDevice.plans[index]?.min_end,
        0,
        0
      );
      const day = dbDevice.plans[index]?.day.split(",");
      console.log(startDate);
      setPlanName(dbDevice.plans[index].name);
      setTimeStart(startDate);
      setTimeEnd(endDate);
      setDate(day);
      setIndex(index);
      handleOpen();
    } else {
      handleOpen();
    }
  }

  function closeModal() {
    setType(null);
    setPlanName("");
    setTimeStart(new Date());
    setTimeEnd(addHours(new Date(), 1));
    setDate([currentDay]);
    Keyboard.dismiss();
    handleClose();
  }

  function toggleSwitch(index) {
    set(
      ref(database, `users/${user?.uid}/device/${id}/plans/${index}/status`),
      !dbDevice.plans[index].status
    );
    set(ref(database, `users/${user?.uid}/device/${id}/change`), "plan");
  }

  function saveModal() {
    const time_start = new Date(timeStart);
    const time_end = new Date(timeEnd);
    time_start.setUTCHours(time_start.getUTCHours() + 7);
    time_end.setUTCHours(time_end.getUTCHours() + 7);

    const hour_start = time_start.getUTCHours();
    const min_start = time_start.getUTCMinutes();
    const hour_end = time_end.getUTCHours();
    const min_end = time_end.getUTCMinutes();
    if (modalType === "Edit") {
      set(ref(database, `users/${user?.uid}/device/${id}/plans/${dbIndex}`), {
        name: planName,
        day: date.join(","),
        hour_start: hour_start,
        hour_end: hour_end,
        min_start: min_start,
        min_end: min_end,
        status: dbDevice.plans[dbIndex].status,
      });
      setIndex(0);
    } else {
      set(ref(database, `users/${user?.uid}/device/${id}/plans`), [
        ...dbDevice.plans,
        {
          name: planName,
          day: date.join(","),
          hour_start: hour_start,
          hour_end: hour_end,
          min_start: min_start,
          min_end: min_end,
          status: true,
        },
      ]);
    }
    set(ref(database, `users/${user?.uid}/device/${id}/change`), "plan");
    setType(null);
    setPlanName("");
    setTimeStart(new Date());
    setTimeEnd(addHours(new Date(), 1));
    setDate([currentDay]);
    Keyboard.dismiss();
    handleClose();
  }

  function deletePlan() {
    const planArr = dbDevice.plans;
    planArr.splice(dbIndex, 1);
    set(ref(database, `users/${user?.uid}/device/${id}/plans`), planArr);
    set(ref(database, `users/${user?.uid}/device/${id}/change`), "plan");
    setIndex(0);
    setType(null);
    setPlanName("");
    setTimeStart(new Date());
    setTimeEnd(addHours(new Date(), 1));
    setDate([currentDay]);
    handleClose();
  }

  async function editName() {
    try {
      if (editAble) {
        await set(
          ref(database, `users/${user?.uid}/device/${id}/name`),
          deviceName
        );
        setEditAble(false);
      } else {
        setEditAble(true);
      }
    } catch (error) {
      Alert.alert("Change Name Error", error.message);
    }
  }

  useEffect(() => {
    getDevice();
  }, []);

  useEffect(() => {
    if (timeStart >= timeEnd) {
      console.log("do");
      const updatedTimeEnd = new Date(timeStart);
      if (timeStart.getHours() >= 23) {
        updatedTimeEnd.setHours(23, 59);
      } else {
        updatedTimeEnd.setHours(timeStart.getHours() + 1, 0, 0, 0);
      }
      setTimeEnd(updatedTimeEnd);
    }
  }, [timeStart, timeEnd]);

  return (
    <GestureHandlerRootView className="flex-1 gap-y-3 pt-3 dark:bg-gray-900">
      <Stack.Screen options={{ headerTitle: t("device.device") }} />
      <View className="flex-row gap-x-2 justify-between px-3 items-center">
        <View className="flex-row">
          <Text
            className="text-xl md:text-3xl dark:text-white"
            style={{ fontFamily: "Kanit" }}
          >
            {t("device.device_name")} :{" "}
          </Text>
          <TextInput
            editable={editAble}
            className="text-xl md:text-3xl dark:text-white"
            style={{ fontFamily: "Kanit" }}
            placeholder="Please Enter Name"
            onChangeText={(text) => {
              setDeviceName(text);
            }}
            value={deviceName}
          />
        </View>
        <TouchableOpacity onPress={editName}>
          {editAble ? (
            <Feather name="check-circle" size={24} color="#31C48D" />
          ) : (
            <AntDesign name="edit" size={24} color="#31C48D" />
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        disabled={dbDevice.plans?.length === 5}
        className={`p-5 rounded-2xl shadow flex-row space-x-4 items-center m-3 bg-white dark:bg-gray-800 ${
          dbDevice.plans?.length !== 5 ? "" : "opacity-40"
        }`}
        onPress={() => {
          openModal("Add");
        }}
      >
        <AntDesign
          name="pluscircleo"
          size={24}
          color={colorScheme === "dark" ? "white" : "black"}
        />
        <Text
          className={`text-lg md:text-xl dark:text-white`}
          style={{ fontFamily: "Kanit" }}
        >
          {t("device.create")}
        </Text>
      </TouchableOpacity>
      <ScrollView className="px-3">
        <View className="space-y-3 pb-3">
          {dbDevice.plans?.map((plan, index) => (
            <TouchableOpacity
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow flex-row space-x-4 justify-between"
              key={index}
              onPress={() => {
                openModal("Edit", index);
              }}
            >
              <View className="space-y-1">
                <Text
                  className="text-lg md:text-xl dark:text-white"
                  style={{ fontFamily: "Kanit" }}
                >
                  {t("device.name")} : {plan.name}
                </Text>
                <Text
                  className="text-sm md:text-base dark:text-white"
                  style={{ fontFamily: "Kanit" }}
                >
                  {t("device.date")} : {plan.day}
                </Text>
                <Text
                  className="text-sm md:text-base dark:text-white"
                  style={{ fontFamily: "Kanit" }}
                >
                  {t("device.start")} :{" "}
                  {String(plan.hour_start).padStart(2, "0")}:
                  {String(plan.min_start).padStart(2, "0")}
                </Text>
                <Text
                  className="text-sm md:text-base dark:text-white"
                  style={{ fontFamily: "Kanit" }}
                >
                  {t("device.end")} : {String(plan.hour_end).padStart(2, "0")}:
                  {String(plan.min_end).padStart(2, "0")}
                </Text>
              </View>
              <Switch
                // trackColor={{ false: '#767577', true: '#81b0ff' }}
                // thumbColor={plan.status ? '#f5dd4b' : '#f4f3f4'}
                // ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  toggleSwitch(index);
                }}
                value={plan.status}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: colorScheme === "dark" ? "#1f2937" : "white",
        }}
      >
        <BottomSheetView>
          <View className="p-4 space-y-4">
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={closeModal}>
                <Text
                  className="text-green-500 text-base md:text-lg font-semibold"
                  style={{ fontFamily: "Kanit" }}
                >
                  {t("device.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveModal}
                disabled={planName === "" || date.length === 0}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`text-base md:text-lg font-semibold ${
                    planName === "" || date.length === 0
                      ? "text-gray-200"
                      : "text-green-500 "
                  }`}
                >
                  {t("device.save")}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="bg-[#EFEFEF] dark:bg-gray-700 text-black dark:text-white p-3 rounded-xl"
              placeholder="Please Enter Name"
              onChangeText={(text) => {
                setPlanName(text);
              }}
              value={planName}
            />
            <View className="flex-row justify-between">
              <View className="space-y-3 w-[45%]">
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className="dark:text-white"
                >
                  {t("device.start")} :
                </Text>
                <TouchableOpacity
                  className="bg-[#EFEFEF] dark:bg-gray-700 p-3 rounded-xl"
                  onPress={() => {
                    setShowStart(true);
                  }}
                >
                  <Text className="dark:text-white">
                    {timeStart.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="space-y-3 w-[45%]">
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className="dark:text-white"
                >
                  {t("device.end")} :
                </Text>
                <TouchableOpacity
                  className="bg-[#EFEFEF] dark:bg-gray-700 p-3 rounded-xl"
                  onPress={() => {
                    setShowEnd(true);
                  }}
                >
                  <Text className="dark:text-white">
                    {timeEnd.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row flex-wrap gap-1 justify-between">
              <TouchableOpacity
                className={`${
                  date.includes("Mon")
                    ? "bg-yellow-400"
                    : "bg-white dark:bg-gray-700"
                } border-2 border-yellow-400 w-12 h-12 rounded-full justify-center items-center`}
                onPress={() => addDate("Mon")}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`md:text-lg font-semibold ${
                    date.includes("Mon") ? "text-white" : "text-yellow-400"
                  }`}
                >
                  {t("device.mon")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${
                  date.includes("Tue")
                    ? "bg-pink-400"
                    : "bg-white dark:bg-gray-700"
                } border-2 border-pink-400 w-12 h-12 rounded-full justify-center items-center`}
                onPress={() => addDate("Tue")}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`md:text-lg font-semibold ${
                    date.includes("Tue") ? "text-white" : "text-pink-400"
                  }`}
                >
                  {t("device.tue")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${
                  date.includes("Wed")
                    ? "bg-green-400"
                    : "bg-white dark:bg-gray-700"
                } border-2 border-green-400 w-12 h-12 rounded-full justify-center items-center`}
                onPress={() => addDate("Wed")}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`md:text-lg font-semibold ${
                    date.includes("Wed") ? "text-white" : "text-green-400"
                  }`}
                >
                  {t("device.wed")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${
                  date.includes("Thu")
                    ? "bg-orange-400"
                    : "bg-white dark:bg-gray-700"
                } border-2 border-orange-400 w-12 h-12 rounded-full justify-center items-center`}
                onPress={() => addDate("Thu")}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`md:text-lg font-semibold ${
                    date.includes("Thu") ? "text-white" : "text-orange-400"
                  }`}
                >
                  {t("device.thu")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${
                  date.includes("Fri")
                    ? "bg-blue-400"
                    : "bg-white dark:bg-gray-700"
                } border-2 border-blue-400 w-12 h-12 rounded-full justify-center items-center`}
                onPress={() => addDate("Fri")}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`md:text-lg font-semibold ${
                    date.includes("Fri") ? "text-white" : "text-blue-400"
                  }`}
                >
                  {t("device.fri")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${
                  date.includes("Sat")
                    ? "bg-purple-400"
                    : "bg-white dark:bg-gray-700"
                } border-2 border-purple-400 w-12 h-12 rounded-full justify-center items-center`}
                onPress={() => addDate("Sat")}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`md:text-lg font-semibold ${
                    date.includes("Sat") ? "text-white" : "text-purple-400"
                  }`}
                >
                  {t("device.sat")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${
                  date.includes("Sun")
                    ? "bg-red-400"
                    : "bg-white dark:bg-gray-700"
                } border-2 border-red-400 w-12 h-12 rounded-full justify-center items-center`}
                onPress={() => addDate("Sun")}
              >
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className={`md:text-lg font-semibold ${
                    date.includes("Sun") ? "text-white" : "text-red-400"
                  }`}
                >
                  {t("device.sun")}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-2">
              <Checkbox
                value={date.length === 7}
                onValueChange={toggleAllDays}
                color={date.length === 7 ? "#22c55e" : undefined}
              />
              <Text style={{ fontFamily: "Kanit" }} className="dark:text-white">
                {t("device.all")}
              </Text>
            </View>
            {modalType === "Edit" ? (
              <View className="pt-6">
                <TouchableOpacity
                  className="bg-red-500 p-4 rounded-xl w-full"
                  onPress={deletePlan}
                >
                  <Text
                    style={{ fontFamily: "Kanit" }}
                    className="text-center text-base md:text-lg text-white"
                  >
                    {t("device.delete")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </BottomSheetView>
      </BottomSheet>
      {showStart && (
        <DateTimePicker
          value={timeStart}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onStart}
        />
      )}
      {showEnd && (
        <DateTimePicker
          value={timeEnd}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onEnd}
        />
      )}
    </GestureHandlerRootView>
  );
}

export default DeviceId;
