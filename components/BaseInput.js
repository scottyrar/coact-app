import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function BaseInput({ leftIcon, rightIcon, placeholder, onChangeText, type, value, mode = 'light' }) {
    return (
        <View className={` ${mode === 'dark' ? 'bg-gray-700 border-white' : 'bg-[#EFEFEF] border-black'} rounded-xl border-2  flex flex-row items-center`}>
            <View className={leftIcon ? 'px-3' : 'pl-2'}>
                {leftIcon ? leftIcon() : null}
            </View>
            <TextInput
                className={`flex-1 py-4 ${mode === 'dark' ? 'text-white' : 'text-black'}`}
                placeholderTextColor={mode === 'dark' ? 'white' : 'black'}
                placeholder={placeholder}
                onChangeText={onChangeText}
                keyboardType={type || 'default'}
                value={value}
            />
            <View className={rightIcon ? 'px-3' : 'pr-2'}>
                {rightIcon ? rightIcon() : null}
            </View>
        </View>
    );
};