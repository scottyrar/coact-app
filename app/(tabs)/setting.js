import { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router"; // Check if this is the correct import
import { AuthStore, appSignOut } from "../../store/authStore";
import BottomSheet,{ BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import * as Updates from "expo-updates";
import LoadingComponent from "../../components/LoadingComponent";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function SettingView() {
  const router = useRouter();
  const user = AuthStore.useState((s) => s.user);
  const nameStore = AuthStore.useState((s) => s.name);
  const { t } = useTranslation();
  const [langs, setLang] = useState("");
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  const snapPoints = useMemo(() => ["30%"], []);
  const bottomSheetRef = useRef(null);

  const handleOpen = () => bottomSheetRef.current?.expand();
  const handleClose = () => bottomSheetRef.current?.close();

  async function getStorage() {
    const language = await AsyncStorage.getItem("language");
    setLang(language);
  }

  const logOut = async () => {
    try {
      await appSignOut();
      router.replace("/signIn"); // Adjust if your router uses a different method
    } catch (error) {
      console.error("Error during logout:", error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  async function changeMode() {
    try {
      setIsLoading(true);
      if (colorScheme === "dark") {
        await AsyncStorage.setItem("mode", "light");
      } else {
        await AsyncStorage.setItem("mode", "dark");
      }
      const mode = await AsyncStorage.getItem("mode");
      console.log(mode);
      toggleColorScheme();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function changeLang(lang) {
    try {
      setIsLoading(true);
      if (lang !== langs) {
        i18n.changeLanguage(lang);
        await AsyncStorage.setItem("language", lang);
        setLang(lang);
        // await Updates.reloadAsync();
      }
      handleClose();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Change Language", error.message);
    }
  }

  async function clerSetting() {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem("language", "en");
      await AsyncStorage.setItem("mode", "light");
      i18n.changeLanguage("en");
      setColorScheme("light");
      setLang("en");
      setIsLoading(false);
      // await Updates.reloadAsync();
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Clear Setting", error.message);
    }
  }

  useEffect(() => {
    getStorage();
  }, []);

  return (
    <GestureHandlerRootView className="dark:bg-gray-900 flex-1">
      <LoadingComponent visible={isLoading} />
      <ScrollView className="space-y-2">
        <TouchableOpacity
          className="flex flex-row p-3 items-center m-3 rounded-xl shadow bg-white dark:bg-gray-800"
          onPress={() => {
            router.push("editprofile");
          }}
        >
          {/* <View className="w-20 h-20 rounded-full bg-gray-500">
            <Image source={{ uri: 'https://gravatar.com/avatar/fde5ae116f1fe72307e783d6879d3654?s=400&d=robohash&r=x' }} className="h-full w-full object-cover object-center rounded-full" />
          </View> */}
          <View className="flex-row justify-between items-center w-full">
            <View className="space-y-1">
              <Text
                style={{ fontFamily: "Kanit" }}
                className="text-xl dark:text-white"
              >
                {user?.email}
              </Text>
              <Text style={{ fontFamily: "Kanit" }} className="dark:text-white">
                @{nameStore}
              </Text>
            </View>
            <View className="rotate-180">
              <Ionicons
                name="chevron-back"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </View>
          </View>
        </TouchableOpacity>
        <View className="space-y-5">
          <Text
            className="text-xl px-3 dark:text-white"
            style={{ fontFamily: "Kanit" }}
          >
            {t("setting.title")}
          </Text>
          <View>
            <TouchableOpacity
              className="border-b dark:border-b-white"
              onPress={handleOpen}
            >
              <Text
                className="text-lg p-3 dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.lang")}
              </Text>
            </TouchableOpacity>
            <View className="border-b dark:border-b-white flex flex-row justify-between items-center">
              <Text
                className="text-lg p-3 dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.mode")}
              </Text>
              <Switch
                // trackColor={{ false: '#767577', true: '#81b0ff' }}
                // thumbColor={plan.status ? '#f5dd4b' : '#f4f3f4'}
                // ios_backgroundColor="#3e3e3e"
                // className="mx-3"
                onValueChange={changeMode}
                value={colorScheme === "dark"}
              />
            </View>
            <TouchableOpacity
              className="border-b dark:border-b-white flex flex-row justify-between items-center"
              onPress={() => {
                router.push("resetpassword");
              }}
            >
              <Text
                className="text-lg p-3 dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.change")}
              </Text>
              <View className="rotate-180">
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-b dark:border-b-white"
              onPress={clerSetting}
            >
              <Text
                className="text-lg p-3 dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.clear")}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity className="border-b dark:border-b-white">
              <Text
                className="text-lg p-3 dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.term")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="border-b dark:border-b-white">
              <Text
                className="text-lg p-3 dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.policy")}{" "}
              </Text>
            </TouchableOpacity>
            <View className="border-b dark:border-b-white">
              <Text
                className="text-lg p-3 dark:text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.ver")} 1.0
              </Text>
            </View>
          </View>
          <View className="flex flex-row justify-center p-5">
            <TouchableOpacity
              className="bg-red-500 rounded-xl py-4 px-10"
              onPress={logOut}
            >
              <Text
                className="text-lg text-white"
                style={{ fontFamily: "Kanit" }}
              >
                {t("setting.sign_out")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: colorScheme === "dark" ? "#1f2937" : "white",
        }}
      >
        <BottomSheetView>
          <View className="pt-5">
            <TouchableOpacity
              className="border-b dark:border-b-white"
              onPress={() => {
                changeLang("en");
              }}
            >
              <Text
                className={`text-lg p-3 dark:text-white ${
                  langs === "en" ? "text-[#31C48D]" : ""
                }`}
                style={{ fontFamily: "Kanit" }}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="border-b dark:border-b-white">
              <Text
                className={`text-lg p-3 dark:text-white ${
                  langs === "th" ? "text-[#31C48D]" : ""
                }`}
                onPress={() => {
                  changeLang("th");
                }}
                style={{ fontFamily: "Kanit" }}
              >
                ภาษาไทย
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}
