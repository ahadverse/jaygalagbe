import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Modal, Portal, TextInput } from 'react-native-paper';

import { colors, fontFamily, radius, shadow } from '../../theme/tokens';

// A generic single-select field for lists too long for a Menu (e.g. 64
// districts, hundreds of thanas) - a modal with a search box over a
// virtualized FlatList instead.
export function SelectField({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = query
    ? options.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  function close() {
    setVisible(false);
    setQuery('');
  }

  return (
    <>
      {/* A disabled TextInput swallows its own touches on Android, so the tap
       * target is the wrapper and the field itself is inert. */}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, expanded: visible }}
        accessibilityLabel={label}
        onPress={() => !disabled && setVisible(true)}
      >
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={value}
            placeholder={placeholder}
            editable={false}
            disabled={disabled}
            right={<TextInput.Icon icon="chevron-down" />}
          />
        </View>
      </Pressable>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={close}
          contentContainerStyle={styles.modal}
        >
          <TextInput
            mode="outlined"
            placeholder="Search"
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            style={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    close();
                  }}
                  style={[styles.row, selected ? styles.rowSelected : null]}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      selected ? styles.rowLabelSelected : null,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    borderRadius: radius.lg,
    maxHeight: '70%',
    backgroundColor: colors.surfaceCard,
    ...shadow('lg'),
  },
  search: {
    margin: 12,
  },
  list: {
    flexGrow: 0,
    // Keeps the last row clear of the sheet's rounded corners, which would
    // otherwise cut the corner off a tinted selected row.
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowSelected: {
    backgroundColor: colors.brand[50],
  },
  rowLabel: {
    fontFamily: fontFamily.text,
    fontSize: 15,
    color: colors.neutral[800],
  },
  rowLabelSelected: {
    fontFamily: fontFamily.textSemibold,
    color: colors.brand[800],
  },
});
