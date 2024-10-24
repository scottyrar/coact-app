import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { database } from '../../firebase';
import { AuthStore, appSignOut } from '../../store/authStore';
import { ref, get } from 'firebase/database';
import { useColorScheme } from "nativewind";
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import LoadingComponent from '../../components/LoadingComponent';
import { usePathname } from 'expo-router';

const History = () => {
  const [widthArr] = useState([150, 100, 100, 100, 60])
  const [history, setHistory] = useState([])
  const user = AuthStore.useState((s) => s.user);
  const dbRef = ref(database, `users/${user?.uid}/history`);
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const tableHead = [t('history.device_name'), t('history.name'), t('history.date'), t('history.time'), t('history.status')]
  const [isLoading, setIsLoading] = useState(false);
  const [deviceNameList, setDeviceList] = useState([])
  const pathname = usePathname();

  async function getHistory() {
    try {
      setIsLoading(true)
      const snapshot = await get(dbRef);
      const data = [];
      snapshot.forEach((childSnapshot) => {
        data.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setHistory(data)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.log(error);
    }
  };

  async function getAllDevice() {
    try {
      const snapshot = await get(
        ref(database, `users/${user?.uid}/device`)
      );
      const data = []
      snapshot.forEach((childSnapshot) => {
        data.push(
          {
            id: childSnapshot.key,
            name: childSnapshot.val().name
          }
        );
      });
      setDeviceList(data)
    } catch (error) {
      console.error();
    }
  }

  useEffect(() => {
    if (pathname === '/history') {
      getHistory();
      getAllDevice();
    }
  }, [pathname])

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: { height: 50, backgroundColor: '#31C48D' },
    text: { textAlign: 'center', fontWeight: '100', color: `${colorScheme === 'dark' ? 'white' : 'black'}`, fontFamily: 'Kanit' },
    hdtext: { textAlign: 'center', fontWeight: '100', color: 'white', fontFamily: 'Kanit' },
    dataWrapper: { marginTop: -1 },
    row: { height: 40, backgroundColor: `${colorScheme === 'dark' ? '#374151' : '#E7E6E1'}` },
  });

  return (
    <>
      <LoadingComponent visible={isLoading} />
      <View style={styles.container} className="dark:bg-gray-900 space-y-3">
        <ScrollView horizontal={true} className="rounded-lg">
          <View>
            <Table className="rounded-t-lg">
              <Row data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.hdtext} className="rounded-t-lg" />
            </Table>
            <ScrollView style={styles.dataWrapper} className="rounded-b-lg">
              <Table className="rounded-b-lg">
                {
                  history.length !== 0 ?
                    history.map((res, index) => (
                      <Row
                        key={index}
                        data={[deviceNameList.find(item => item.id === res.device).name, res.onplan ? 'Plan' : 'Manual', res.date, res.time, res.status]}
                        widthArr={widthArr}
                        style={[styles.row, index % 2 && { backgroundColor: `${colorScheme === 'dark' ? '#1f2937' : '#F7F6E7'}` }]}
                        textStyle={styles.text}
                        className={`${history.length === index + 1 ? 'rounded-b-lg' : 'rounded-none'}`}
                      />
                    )) :
                    <View className="h-[450px] bg-gray-300 dark:bg-[#1f2937] rounded-b-lg flex-row justify-center items-center">
                      <Text className="text-black dark:text-white text-2xl" style={{ fontFamily: 'Kanit' }}>
                        {t('history.dont')}
                      </Text>
                    </View>
                }
              </Table>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default History;
