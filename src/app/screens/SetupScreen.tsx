import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Background from '../index';

const TEXT = '#455556';
const MUTED = '#7AA8A8';

type ParamType = 'text' | 'number' | 'date' | 'choice';

type Parameter = {
  id: string;
  label: string;
  type: ParamType;
  options?: string[];
  isDefault: boolean;
};

const DEFAULT_PARAMETERS: Parameter[] = [
  { id: 'name', label: 'Name', type: 'text', isDefault: true },
  { id: 'age', label: 'Age', type: 'number', isDefault: true },
  { id: 'sex', label: 'Sex', type: 'choice', options: ['Male', 'Female'], isDefault: true },
  { id: 'birthdate', label: 'Birthdate', type: 'date', isDefault: true },
  { id: 'contact', label: 'Contact No.', type: 'text', isDefault: true },
];

const TYPES: { value: ParamType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'choice', label: 'Choice' },
];

type Props = {
  onSave?: (parameters: Parameter[]) => void;
  onBack?: () => void;
};

export default function SetupScreen({ onSave, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [parameters, setParameters] = useState<Parameter[]>(DEFAULT_PARAMETERS);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<ParamType>('text');
  const [optionsText, setOptionsText] = useState('');
  const [error, setError] = useState('');

  const addParameter = () => {
    const trimmed = label.trim();
    if (!trimmed) return setError('Enter a parameter name.');
    if (parameters.some((p) => p.label.toLowerCase() === trimmed.toLowerCase())) {
      return setError('That parameter already exists.');
    }

    const options =
      type === 'choice'
        ? optionsText.split(',').map((o) => o.trim()).filter(Boolean)
        : undefined;
    if (type === 'choice' && (!options || options.length < 2)) {
      return setError('Add at least two options, separated by commas.');
    }

    setParameters((prev) => [
      ...prev,
      { id: Date.now().toString(), label: trimmed, type, options, isDefault: false },
    ]);
    setLabel('');
    setOptionsText('');
    setType('text');
    setError('');
  };

  const removeParameter = (id: string) =>
    setParameters((prev) => prev.filter((p) => p.id !== id || p.isDefault));

  const defaults = parameters.filter((p) => p.isDefault);
  const custom = parameters.filter((p) => !p.isDefault);

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <Background />

      {/* Header */}
      <View
        className="px-5 pb-2 flex-row items-center"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity onPress={onBack} className="w-11 h-11 items-center justify-center" activeOpacity={0.6}>
          <Ionicons name="arrow-back" size={26} color={TEXT} />
        </TouchableOpacity>
        <Text className="ml-2" style={{ fontFamily: 'Inter_700Bold', fontSize: 22, color: TEXT }}>
          Patient Setup
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Default parameters */}
          <Text className="mt-4 mb-2" style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: MUTED }}>
            DEFAULT PARAMETERS
          </Text>
          {defaults.map((p) => (
            <ParamRow key={p.id} param={p} />
          ))}

          {/* Custom parameters */}
          <Text className="mt-6 mb-2" style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: MUTED }}>
            CUSTOM PARAMETERS
          </Text>
          {custom.length === 0 && (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: MUTED }}>
              None yet. Add one below.
            </Text>
          )}
          {custom.map((p) => (
            <ParamRow key={p.id} param={p} onRemove={() => removeParameter(p.id)} />
          ))}

          {/* Add form */}
          <View className="mt-6 p-4 rounded-[20px] border border-[#9CC4C4] bg-white/35">
            <TextInput
              className="px-4 py-3 rounded-[16px] border border-[#8DB8B8] bg-[#C8EDEC]"
              style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: TEXT }}
              placeholder="Parameter name (e.g. Blood Pressure)"
              placeholderTextColor={TEXT}
              value={label}
              onChangeText={setLabel}
            />

            <View className="flex-row flex-wrap mt-3">
              {TYPES.map((t) => {
                const active = t.value === type;
                return (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setType(t.value)}
                    activeOpacity={0.7}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                      active ? 'bg-[#00A3A3] border-[#00A3A3]' : 'border-[#9CC4C4]'
                    }`}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 13,
                        color: active ? '#FFFFFF' : TEXT,
                      }}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {type === 'choice' && (
              <TextInput
                className="mt-1 px-4 py-3 rounded-[16px] border border-[#8DB8B8] bg-[#C8EDEC]"
                style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: TEXT }}
                placeholder="Options, comma separated"
                placeholderTextColor={TEXT}
                value={optionsText}
                onChangeText={setOptionsText}
              />
            )}

            {!!error && (
              <Text className="mt-2" style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#B00020' }}>
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={addParameter}
              activeOpacity={0.7}
              className="mt-3 flex-row items-center justify-center py-3 rounded-[28px] border border-[#9CC4C4] bg-white/35"
            >
              <Ionicons name="add" size={22} color={MUTED} />
              <Text className="ml-2" style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: TEXT }}>
                Add Parameter
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={() => onSave?.(parameters)}
            activeOpacity={0.7}
            className="mt-6 py-3 rounded-[28px] items-center bg-[#00A3A3]"
          >
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 16, color: '#FFFFFF' }}>
              Save Setup
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ParamRow({ param, onRemove }: { param: Parameter; onRemove?: () => void }) {
  return (
    <View className="mb-2 px-4 py-3 flex-row items-center rounded-[16px] border border-[#9CC4C4] bg-white/35">
      <View className="flex-1">
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: TEXT }}>{param.label}</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: MUTED }}>
          {param.type}
          {param.options ? ` · ${param.options.join(', ')}` : ''}
        </Text>
      </View>
      {param.isDefault ? (
        <Ionicons name="lock-closed" size={18} color={MUTED} />
      ) : (
        <TouchableOpacity onPress={onRemove} hitSlop={10} activeOpacity={0.6}>
          <Ionicons name="close-circle" size={22} color={MUTED} />
        </TouchableOpacity>
      )}
    </View>
  );
}