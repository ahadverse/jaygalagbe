import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { List, Modal, Portal, TextInput, useTheme } from 'react-native-paper';

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
  const theme = useTheme();
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
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        placeholder={placeholder}
        editable={false}
        disabled={disabled}
        right={<TextInput.Icon icon="chevron-down" />}
        onPressIn={() => !disabled && setVisible(true)}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={close}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
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
            renderItem={({ item }) => (
              <List.Item
                title={item}
                onPress={() => {
                  onChange(item);
                  close();
                }}
              />
            )}
          />
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    borderRadius: 12,
    maxHeight: '70%',
  },
  search: {
    margin: 12,
  },
  list: {
    flexGrow: 0,
  },
});
