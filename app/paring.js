import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Keyboard,
  Alert,
} from "react-native";
import { StepStore } from "../store/stepStore";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { TextInput } from "react-native-gesture-handler";
import { useMemo, useRef, useState, useEffect } from "react";
import { AuthStore } from "../store/authStore";
import * as Network from "expo-network";
import LoadingComponent from "../components/LoadingComponent";
import axios from "axios";
import WifiSignalIcon from "../assets/icons/WifiSignal";
import { useColorScheme } from "nativewind";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function ParingView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const user = AuthStore.useState((s) => s.user);
  const current_step = StepStore.useState((s) => s.current_step);
  const step1_complete = StepStore.useState((s) => s.step1_complete);
  const step2_complete = StepStore.useState((s) => s.step2_complete);
  const step3_complete = StepStore.useState((s) => s.step3_complete);
  const screenHeight = Dimensions.get("window").height;
  const scrollViewHeight = 0.9 * screenHeight;
  const [wifiSSID, setSSID] = useState("");
  const [wifiPassword, setPassword] = useState("");
  const [toggleShow, setShow] = useState(false);
  const [wifiList, setWifiList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const snapPoints = useMemo(() => ["80%", "95%"], []);
  const bottomSheetRef = useRef(null);

  const handleOpen = () => bottomSheetRef.current?.expand();
  const handleClose = () => bottomSheetRef.current?.close();

  useEffect(() => {
    if (current_step === 2) {
      getWifi();
    }
  }, [current_step]);

  async function getWifi() {
    try {
      setIsLoading(true);
      const response = await axios.get("http://192.168.1.1/scan");
      const wifimap = response.data.map((item) => ({
        ssid: item.ssid,
        rssi: Math.abs(item.rssi),
        security: item.security,
      }));
      setWifiList(wifimap);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      Alert.alert("Get Wifi Error", error.message);
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSSID(item.ssid), handleOpen();
      }}
      className="p-2 border-b flex-row gap-x-2 justify-between items-center"
    >
      <Text
        style={{ fontFamily: "Kanit" }}
        className="text-base dark:text-white"
      >
        {item.ssid}
      </Text>
      <View className="flex flex-row gap-x-3 items-center">
        <View>
          {item.security ? (
            <Feather name="lock" size={24} color="#31C48D" />
          ) : (
            <Feather name="unlock" size={24} color="#31C48D" />
          )}
        </View>
        <View>
          <WifiSignalIcon strength={item.rssi} />
        </View>
      </View>
    </TouchableOpacity>
  );

  function updateStore() {
    StepStore.update((store) => {
      store.current_step = store.current_step + 1;
      switch (current_step) {
        case 1:
          store.step1_complete = true;
          break;
        case 2:
          store.step2_complete = true;
          break;
        case 3:
          store.step3_complete = true;
          break;
        default:
          break;
      }
    });
  }

  async function nextStep() {
    if (current_step !== 3) {
      if (current_step === 1) {
        const ip = await Network.getIpAddressAsync();
        // change to check mac address
        // if (ip.includes('192.168.1.1')) {
        updateStore();
        // } else {
        //     Alert.alert("Connection Error", "Please connect wifi ssid include Co'act");
        // }
      } else if (current_step === 3) {
        const internet = await Network.getNetworkStateAsync();
        console.log(internet.isInternetReachable);
        if (!internet.isInternetReachable) {
          Alert.alert("Connection Error", "Please connect wifi have internet");
        } else {
          updateStore();
        }
      } else {
        updateStore();
      }
    } else {
      StepStore.update((store) => {
        store.current_step = 1;
        store.step1_complete = false;
        store.step2_complete = false;
        store.step3_complete = false;
      });
      router.replace("home");
    }
  }

  async function sendData() {
    try {
      console.log(wifiSSID);
      console.log(wifiPassword);
      setIsLoading(true);
      await axios.post("http://192.168.1.1/endpoint", {
        wifissid: wifiSSID,
        password: wifiPassword,
        uuid: user?.uid,
      });
      setSSID("");
      setPassword("");
      handleClose();
      Keyboard.dismiss();
      setIsLoading(false);
      nextStep();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      Alert.alert("Send Wifi Error", error.message);
    }
  }

  function closeModal() {
    setSSID("");
    setPassword("");
    Keyboard.dismiss();
    handleClose();
  }

  useEffect(() => {
    StepStore.update((store) => {
      store.current_step = 1;
      store.step1_complete = false;
      store.step2_complete = false;
      store.step3_complete = false;
    });
  }, []);

  return (
    <GestureHandlerRootView>
      <LoadingComponent visible={isLoading} />
      <View className="flex-1 justify-between dark:bg-gray-900">
        <View className="flex-row gap-x-12 justify-center p-5">
          <TouchableOpacity
            className={`${
              step1_complete ? "bg-lime-500" : "bg-gray-500"
            } rounded-full w-12 h-12 justify-center items-center`}
          >
            {!step1_complete ? (
              <Text
                className="text-lg dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                1
              </Text>
            ) : (
              <AntDesign
                name="check"
                size={18}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className={`${
              step2_complete ? "bg-lime-500" : "bg-gray-500"
            } rounded-full w-12 h-12 justify-center items-center`}
          >
            {!step2_complete ? (
              <Text
                className="text-lg dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                2
              </Text>
            ) : (
              <AntDesign
                name="check"
                size={18}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className={`${
              step3_complete ? "bg-lime-500" : "bg-gray-500"
            } rounded-full w-12 h-12 justify-center items-center`}
          >
            {!step3_complete ? (
              <Text
                className="text-lg dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                3
              </Text>
            ) : (
              <AntDesign
                name="check"
                size={18}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            )}
          </TouchableOpacity>
        </View>
        <View className="space-y-10">
          {current_step === 1 ? (
            <View className="items-center">
              <Text
                style={{ fontFamily: "Kanit" }}
                className="text-xl dark:text-white"
              >
                {t("paring.pair")}
              </Text>
              <Text
                style={{ fontFamily: "Kanit" }}
                className="text-base dark:text-white"
              >
                {t("paring.please")}
              </Text>
              <Text
                style={{ fontFamily: "Kanit" }}
                className="text-base dark:text-white"
              >
                {t("paring.name")}
              </Text>
              <Ionicons
                name="ios-wifi"
                size={300}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </View>
          ) : null}
          {current_step === 2 ? (
            <View className="space-y-10">
              <View className="items-center">
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className="text-xl dark:text-white"
                >
                  {t("paring.choose")}
                </Text>
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className="text-base dark:text-white"
                >
                  {t("paring.make")}
                </Text>
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className="text-base dark:text-white"
                >
                  {t("paring.network")}
                </Text>
              </View>
              <FlatList
                className="h-52"
                data={wifiList}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
              />
              <View className="space-y-2">
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className="text-base text-center dark:text-white"
                  onPress={getWifi}
                >
                  {t("paring.cant")}
                </Text>
                <Text
                  style={{ fontFamily: "Kanit" }}
                  className="text-base text-center dark:text-white"
                  onPress={handleOpen}
                >
                  {t("paring.fill")}
                </Text>
              </View>
            </View>
          ) : null}
          {current_step === 3 ? (
            <View className="items-center">
              <Text
                style={{ fontFamily: "Kanit" }}
                className="text-xl dark:text-white"
              >
                {t("paring.success")}
              </Text>
              <Text
                style={{ fontFamily: "Kanit" }}
                className="text-base dark:text-white"
              >
                {t("paring.you")}
              </Text>
              <AntDesign
                name="check"
                size={300}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </View>
          ) : null}
        </View>
        <View className="p-5">
          {current_step !== 2 ? (
            <TouchableOpacity
              onPress={nextStep}
              className="bg-lime-300 rounded-xl p-5"
            >
              <Text style={{ fontFamily: "Kanit" }} className="text-center">
                {t("paring.next")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: colorScheme === "dark" ? "#1f2937" : "white",
        }}
      >
        <BottomSheetView>
          <View className="p-5 space-y-5">
            <TouchableOpacity onPress={closeModal}>
              <Text
                style={{ fontFamily: "Kanit" }}
                className="text-green-500 text-base md:text-lg font-semibold"
              >
                {t("paring.cancel")}
              </Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: "Kanit" }} className="dark:text-white">
              {t("paring.ssid")}
            </Text>
            <TextInput
              value={wifiSSID}
              onChangeText={(text) => setSSID(text)}
              className="bg-[#EFEFEF] dark:bg-gray-700 dark:text-white p-3 rounded-xl shadow"
            />
            <Text style={{ fontFamily: "Kanit" }} className="dark:text-white">
              {t("paring.pass")}
            </Text>
            <TextInput
              value={wifiPassword}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              className="bg-[#EFEFEF] dark:bg-gray-700 dark:text-white p-3 rounded-xl shadow"
            />
            <TouchableOpacity
              onPress={isLoading ? null : sendData}
              disabled={isLoading}
              className="bg-lime-300 rounded-xl p-5 disabled:bg-slate-400"
            >
              <Text style={{ fontFamily: "Kanit" }} className="text-center">
                {isLoading ? t("paring.loading") : t("paring.next")}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
